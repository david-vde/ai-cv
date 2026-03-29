<?php

namespace App\Webhook;

use App\ChatLogger\ChatLoggerInterface;
use App\ChatLogger\ChatLogStatus;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\HttpClientInterface;

readonly class N8nQuestionPusher implements QuestionPusherInterface
{
    /**
     * @param HttpClientInterface $httpClient
     * @param ChatLoggerInterface $chatLogger
     * @param string $N8NWebhookUrl
     */
    public function __construct(
        private HttpClientInterface $httpClient,
        private ChatLoggerInterface $chatLogger,
        #[Autowire('%env(N8N_WEBHOOK_URL)%')]
        private string $N8NWebhookUrl)
    {
    }

    /**
     * @param array $chatRequest
     * @param string $sessionId
     * @return string[]
     */
    public function pushTextRequest(array $chatRequest, string $sessionId): array
    {
        $allMessages = '';
        $answer = null;
        $error = null;

        foreach ($chatRequest['messages'] as $message) {
            $allMessages .= (!empty($allMessages) ? "\n" : "") . $message['text'];
        }

        $this->chatLogger->log('user', $allMessages, $sessionId);

        try {
            $response = $this->httpClient->request(
                'POST',
                $this->N8NWebhookUrl . "?sessionId=$sessionId",
                [
                    'json' => [
                        'question' => $allMessages
                    ]
                ]
            );

            $data = $response->toArray();

            $answer = $data['output'];
            $status = ChatLogStatus::SUCCESS;

        } catch (\Throwable $e) {
            $status = ChatLogStatus::ERROR;
            $error = $e->getMessage();
        }

        $this->chatLogger->log('ai', (string)$answer, $sessionId, $status, $error);

        return [
            'answer' => $answer,
        ];
    }

    public function pushVoiceRequest(UploadedFile $audioFile, string $sessionId): array
    {
        $answer = null;
        $error = null;

        try {
            $formFields = [
                'question' => DataPart::fromPath(
                    $audioFile->getPathname(),
                    'audio.' . ($audioFile->guessExtension() ?? 'webm'),
                    $audioFile->getClientMimeType()
                ),
            ];

            $formData = new FormDataPart($formFields);

            $response = $this->httpClient->request('POST', $this->N8NWebhookUrl . "?sessionId=$sessionId", [
                'headers' => $formData->getPreparedHeaders()->toArray(),
                'body' => $formData->bodyToIterable(),
            ]);

            $data = $response->toArray();

            $answer = $data['output'] ?? null;
            $textQuestion = $data['question'] ?? null;

            $this->chatLogger->log('user', $textQuestion, $sessionId);

            $status = ChatLogStatus::SUCCESS;

        } catch (\Throwable $e) {
            $status = ChatLogStatus::ERROR;
            $error = $e->getMessage();
        }

        $this->chatLogger->log('ai', (string)$answer, $sessionId, $status, $error);

        return [
            'answer' => $answer,
        ];
    }
}
