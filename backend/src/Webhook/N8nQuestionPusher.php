<?php

namespace App\Webhook;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;

readonly class N8nQuestionPusher implements QuestionPusherInterface
{
    /**
     * @param HttpClientInterface $httpClient
     * @param string $N8NWebhookUrl
     */
    public function __construct(
        private HttpClientInterface $httpClient,
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

        foreach ($chatRequest['messages'] as $message) {
            $allMessages .= (!empty($allMessages) ? "\n" : "") . $message['text'];
        }

        try {
            $response = $this->httpClient->request(
                'POST',
                $this->N8NWebhookUrl,
                [
                    'json' => [
                        'question' => $allMessages,
                        'sessionId' => $sessionId
                    ]
                ]
            );

            $data = $response->toArray();
            $answer = $data['output'];

        } catch (\Throwable $e) {
            $answer = null;
        }

        return [
            'answer' => $answer,
        ];
    }
}
