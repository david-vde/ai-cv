<?php

namespace App\Tests\Webhook;

use App\ChatLogger\ChatLoggerInterface;
use App\Webhook\N8nQuestionPusher;
use PHPUnit\Framework\MockObject\Exception;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

final class N8nQuestionPusherTest extends TestCase
{
    private (HttpClientInterface&MockObject)|null $httpClient;
    private (ChatLoggerInterface&MockObject)|null $chatLogger;
    private ?N8nQuestionPusher $n8nQuestionPusher;
    private string $n8nWebhookUrl = 'http://webhook.url';

    /**
     * @return void
     * @throws Exception
     */
    protected function setUp(): void
    {
       $this->httpClient = $this->createMock(HttpClientInterface::class);
       $this->chatLogger = $this->createMock(ChatLoggerInterface::class);
       $this->n8nQuestionPusher = new N8nQuestionPusher($this->httpClient, $this->chatLogger, $this->n8nWebhookUrl);
    }

    /**
     * @return void
     */
    protected function tearDown(): void
    {
        $this->httpClient = null;
        $this->chatLogger = null;
        $this->n8nQuestionPusher = null;
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testPushTextRequestReturnsAnswerWhenSuccess(): void
    {
        $chatRequest = [
            'messages' => [
                ['text' => 'Hello'],
                ['text' => 'How are you?']
            ]
        ];
        $sessionId = 'session-123';
        $expectedAnswer = 'Some AI response';

        $mockResponse = $this->createMock(ResponseInterface::class);
        $mockResponse->expects($this->once())
            ->method('toArray')
            ->willReturn(['output' => $expectedAnswer]);

        $matcher = $this->exactly(2);
        $this
            ->chatLogger
            ->expects($matcher)
            ->method('log')
            ->with(
                $this->callback(function(string $sender) use ($matcher) {
                    return match ($matcher->numberOfInvocations()) {
                        1 => $sender === 'user',
                        2 => $sender === 'ai',
                        default => false,
                    };
                }),
                $this->callback(function(string $messages) use ($matcher) {
                    return match ($matcher->numberOfInvocations()) {
                        1 => $messages === "Hello\nHow are you?",
                        2 => $messages === 'Some AI response',
                        default => false,
                    };
                }),
                $sessionId
            )
        ;
        $this->httpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                $this->n8nWebhookUrl,
                [
                    'json' => [
                        'question' => "Hello\nHow are you?",
                        'sessionId' => $sessionId
                    ]
                ]
            )
            ->willReturn($mockResponse);

        $result = $this->n8nQuestionPusher->pushTextRequest($chatRequest, $sessionId);
        $this->assertEquals(['answer' => $expectedAnswer], $result);
    }

    /**
     * @return void
     */
    public function testPushTextRequestReturnsNullWhenException(): void
    {
        $chatRequest = [
            'messages' => [
                ['text' => 'Hello'],
                ['text' => 'How are you?']
            ]
        ];
        $sessionId = 'session-123';

        $this->httpClient->expects($this->once())
            ->method('request')
            ->willThrowException(new \Exception('Some Exception'));

        $result = $this->n8nQuestionPusher->pushTextRequest($chatRequest, $sessionId);
        $this->assertEquals(['answer' => null], $result);
    }
}
