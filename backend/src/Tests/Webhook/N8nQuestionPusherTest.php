<?php

namespace App\Tests\Webhook;

use App\ChatLogger\ChatLoggerInterface;
use App\ChatLogger\ChatLogStatus;
use App\Webhook\N8nQuestionPusher;
use PHPUnit\Framework\MockObject\Exception;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
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
            ->willReturnCallback(function (
                string $sender,
                string $message,
                string $session,
                ChatLogStatus $status = ChatLogStatus::SUCCESS,
                ?string $error = null
            ) use ($matcher, $sessionId, $expectedAnswer) {
                match ($matcher->numberOfInvocations()) {
                    1 => $this->assertLogCall($sender, 'user', $message, "Hello\nHow are you?", $session, $sessionId),
                    2 => $this->assertLogCall($sender, 'ai', $message, $expectedAnswer, $session, $sessionId, $status, ChatLogStatus::SUCCESS, $error, null),
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
                ?string $error = null
            ) use ($matcher, $sessionId) {
                match ($matcher->numberOfInvocations()) {
                    1 => $this->assertLogCall($sender, 'user', $message, "Hello\nHow are you?", $session, $sessionId),
                    2 => $this->assertLogCall($sender, 'ai', $message, '', $session, $sessionId, $status, ChatLogStatus::ERROR, $error, 'Some Exception'),
                };
            })
        ;

        $this->httpClient->expects($this->once())
            ->method('request')
            ->willThrowException(new \Exception('Some Exception'));

        $result = $this->n8nQuestionPusher->pushTextRequest($chatRequest, $sessionId);
        $this->assertEquals(['answer' => null], $result);
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testPushVoiceRequestReturnsAnswerWhenSuccess(): void
    {
        $sessionId = 'session-456';
        $expectedAnswer = 'Voice AI response';
        $expectedTextQuestion = 'What was said in audio';

        $audioFile = $this->createMock(UploadedFile::class);
        $audioFile->method('getPathname')->willReturn(__FILE__);
        $audioFile->method('guessExtension')->willReturn('webm');
        $audioFile->method('getClientMimeType')->willReturn('audio/webm');

        $mockResponse = $this->createMock(ResponseInterface::class);
        $mockResponse->expects($this->once())
            ->method('toArray')
            ->willReturn(['output' => $expectedAnswer, 'question' => $expectedTextQuestion]);

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
                ?string $error = null
            ) use ($matcher, $sessionId, $expectedAnswer, $expectedTextQuestion) {
                match ($matcher->numberOfInvocations()) {
                    1 => $this->assertLogCall($sender, 'user', $message, $expectedTextQuestion, $session, $sessionId),
                    2 => $this->assertLogCall($sender, 'ai', $message, $expectedAnswer, $session, $sessionId, $status, ChatLogStatus::SUCCESS, $error, null),
                };
            })
        ;

        $this->httpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                $this->n8nWebhookUrl . '?sessionId=' . $sessionId,
                $this->callback(function (array $options): bool {
                    return isset($options['headers']) && isset($options['body']);
                })
            )
            ->willReturn($mockResponse);

        $result = $this->n8nQuestionPusher->pushVoiceRequest($audioFile, $sessionId);
        $this->assertEquals(['answer' => $expectedAnswer], $result);
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testPushVoiceRequestReturnsNullWhenException(): void
    {
        $sessionId = 'session-456';

        $audioFile = $this->createMock(UploadedFile::class);
        $audioFile->method('getPathname')->willReturn(__FILE__);
        $audioFile->method('guessExtension')->willReturn('webm');
        $audioFile->method('getClientMimeType')->willReturn('audio/webm');

        $this
            ->chatLogger
            ->expects($this->once())
            ->method('log')
            ->with('ai', '', $sessionId, ChatLogStatus::ERROR, 'Voice Exception')
        ;

        $this->httpClient->expects($this->once())
            ->method('request')
            ->willThrowException(new \Exception('Voice Exception'));

        $result = $this->n8nQuestionPusher->pushVoiceRequest($audioFile, $sessionId);
        $this->assertEquals(['answer' => null], $result);
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testPushVoiceRequestReturnsNullAnswerWhenOutputMissing(): void
    {
        $sessionId = 'session-789';
        $expectedTextQuestion = 'Transcribed question';

        $audioFile = $this->createMock(UploadedFile::class);
        $audioFile->method('getPathname')->willReturn(__FILE__);
        $audioFile->method('guessExtension')->willReturn('webm');
        $audioFile->method('getClientMimeType')->willReturn('audio/webm');

        $mockResponse = $this->createMock(ResponseInterface::class);
        $mockResponse->expects($this->once())
            ->method('toArray')
            ->willReturn(['question' => $expectedTextQuestion]);

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
                ?string $error = null
            ) use ($matcher, $sessionId, $expectedTextQuestion) {
                match ($matcher->numberOfInvocations()) {
                    1 => $this->assertLogCall($sender, 'user', $message, $expectedTextQuestion, $session, $sessionId),
                    2 => $this->assertLogCall($sender, 'ai', $message, '', $session, $sessionId, $status, ChatLogStatus::SUCCESS, $error, null),
                };
            })
        ;

        $this->httpClient->expects($this->once())
            ->method('request')
            ->willReturn($mockResponse);

        $result = $this->n8nQuestionPusher->pushVoiceRequest($audioFile, $sessionId);
        $this->assertEquals(['answer' => null], $result);
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testPushVoiceRequestFallsBackToWebmWhenGuessExtensionReturnsNull(): void
    {
        $sessionId = 'session-ext';
        $expectedAnswer = 'Fallback extension response';
        $expectedTextQuestion = 'Audio transcription';

        $audioFile = $this->createMock(UploadedFile::class);
        $audioFile->method('getPathname')->willReturn(__FILE__);
        $audioFile->method('guessExtension')->willReturn(null);
        $audioFile->method('getClientMimeType')->willReturn('audio/webm');

        $mockResponse = $this->createMock(ResponseInterface::class);
        $mockResponse->expects($this->once())
            ->method('toArray')
            ->willReturn(['output' => $expectedAnswer, 'question' => $expectedTextQuestion]);

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
                ?string $error = null
            ) use ($matcher, $sessionId, $expectedAnswer, $expectedTextQuestion) {
                match ($matcher->numberOfInvocations()) {
                    1 => $this->assertLogCall($sender, 'user', $message, $expectedTextQuestion, $session, $sessionId),
                    2 => $this->assertLogCall($sender, 'ai', $message, $expectedAnswer, $session, $sessionId, $status, ChatLogStatus::SUCCESS, $error, null),
                };
            })
        ;

        $this->httpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                $this->n8nWebhookUrl . '?sessionId=' . $sessionId,
                $this->callback(function (array $options): bool {
                    return isset($options['headers']) && isset($options['body']);
                })
            )
            ->willReturn($mockResponse);

        $result = $this->n8nQuestionPusher->pushVoiceRequest($audioFile, $sessionId);
        $this->assertEquals(['answer' => $expectedAnswer], $result);
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
