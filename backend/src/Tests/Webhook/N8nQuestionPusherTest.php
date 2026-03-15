<?php

namespace App\Tests\Webhook;

use App\Webhook\N8nQuestionPusher;
use PHPUnit\Framework\MockObject\Exception;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

final class N8nQuestionPusherTest extends TestCase
{
    private (HttpClientInterface&MockObject)|null $httpClient;
    private ?N8nQuestionPusher $n8nQuestionPusher;
    private string $n8nWebhookUrl = 'http://webhook.url';

    /**
     * @return void
     * @throws Exception
     */
    protected function setUp(): void
    {
       $this->httpClient = $this->createMock(HttpClientInterface::class);
       $this->n8nQuestionPusher = new N8nQuestionPusher($this->httpClient, $this->n8nWebhookUrl);
    }

    /**
     * @return void
     */
    protected function tearDown(): void
    {
        $this->httpClient = null;
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
