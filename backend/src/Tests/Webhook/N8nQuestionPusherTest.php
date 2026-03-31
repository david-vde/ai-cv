<?php

namespace App\Tests\Webhook;

use App\ChatLogger\ChatLoggerInterface;
use App\ChatLogger\ChatLogStatus;
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
        $transcribed = true;

        $mockResponse = $this->createMock(ResponseInterface::class);
        $mockResponse->expects($this->once())
            ->method('toArray')
            ->willReturn(['output' => $expectedAnswer]);

        $matcher = $this->exactly(2);
        $this
            ->chatLogger
            ->expects($matcher)
            ->method('log')
            ->willReturnCallback(function (
                string $sender,
                string $message,
                string $session,
                ChatLogStatus $status = ChatLogStatus::SUCCESS,
                ?string $error = null,
                bool $transcoded = false
            ) use ($matcher, $sessionId, $expectedAnswer, $transcribed) {
                match ($matcher->numberOfInvocations()) {
                    1 => $this->assertLogCall($sender, 'user', $message, "Hello\nHow are you?", $session, $sessionId, $status, null, $error, null, $transcoded, $transcribed),
                    2 => $this->assertLogCall($sender, 'ai', $message, $expectedAnswer, $session, $sessionId, $status, ChatLogStatus::SUCCESS, $error, null, $transcoded, false),
                };
            })
        ;
        $this->httpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                $this->n8nWebhookUrl . '?sessionId=' . $sessionId,
                [
                    'json' => [
                        'question' => "Hello\nHow are you?"
                    ]
                ]
            )
            ->willReturn($mockResponse);

        $result = $this->n8nQuestionPusher->pushTextRequest($chatRequest, $sessionId, $transcribed);
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
        $transcribed = false;

        $matcher = $this->exactly(2);
        $this
            ->chatLogger
            ->expects($matcher)
            ->method('log')
            ->willReturnCallback(function (
                string $sender,
                string $message,
                string $session,
                ChatLogStatus $status = ChatLogStatus::SUCCESS,
                ?string $error = null,
                bool $transcoded = false
            ) use ($matcher, $sessionId, $transcribed) {
                match ($matcher->numberOfInvocations()) {
                    1 => $this->assertLogCall($sender, 'user', $message, "Hello\nHow are you?", $session, $sessionId, null, null, null, null, $transcoded, $transcribed),
                    2 => $this->assertLogCall($sender, 'ai', $message, '', $session, $sessionId, $status, ChatLogStatus::ERROR, $error, 'Some Exception', $transcoded, false),
                };
            })
        ;

        $this->httpClient->expects($this->once())
            ->method('request')
            ->willThrowException(new \Exception('Some Exception'));

        $result = $this->n8nQuestionPusher->pushTextRequest($chatRequest, $sessionId, $transcribed);
        $this->assertEquals(['answer' => null], $result);
    }

    private function assertLogCall(
        string $actualSender,
        string $expectedSender,
        string $actualMessage,
        string $expectedMessage,
        string $actualSession,
        string $expectedSession,
        ?ChatLogStatus $actualStatus = null,
        ?ChatLogStatus $expectedStatus = null,
        ?string $actualError = null,
        ?string $expectedError = null,
    ): void {
        $this->assertEquals($expectedSender, $actualSender);
        $this->assertEquals($expectedMessage, $actualMessage);
        $this->assertEquals($expectedSession, $actualSession);
        if ($expectedStatus !== null) {
            $this->assertEquals($expectedStatus, $actualStatus);
        }
        if ($expectedError !== null) {
            $this->assertEquals($expectedError, $actualError);
        }
    }
}
