<?php

namespace App\Tests\Controller;

use App\ChatLogger\ChatLoggerInterface;
use App\Controller\ChatController;
use App\Webhook\QuestionPusherInterface;
use PHPUnit\Framework\MockObject\Exception;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class ChatControllerTest extends TestCase
{
    private (QuestionPusherInterface&MockObject)|null $pusher;
    private (ChatLoggerInterface&MockObject)|null $logger;
    private ?ChatController $controller;

    /**
     * @return void
     * @throws Exception
     */
    protected function setUp(): void
    {
        $this->pusher = $this->createMock(QuestionPusherInterface::class);
        $this->logger = $this->createMock(ChatLoggerInterface::class);
        $this->controller = new ChatController($this->pusher, $this->logger);
    }

    /**
     * @return void
     */
    protected function tearDown(): void
    {
        $this->pusher = null;
        $this->controller = null;
        $this->logger = null;
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testChatReturnsResponseArrayOnSuccess(): void
    {
        $question = [
            'messages' => [
                ['text' => 'Some question ?']
            ]
        ];
        $sessionId = 'session_test';
        $requestData = [
            'question' => $question,
            'sessionId' => $sessionId
        ];
        $jsonContent = json_encode($requestData);

        $request = $this->createMock(Request::class);
        $request->method('getContent')->willReturn($jsonContent);

        $httpClient = $this->createMock(HttpClientInterface::class);

        $expectedResponse = ['answer' => 'Paris'];
        $this->pusher->expects($this->once())
            ->method('pushTextRequest')
            ->with($question, $sessionId)
            ->willReturn($expectedResponse);


        $response = $this->controller->chat($request, $httpClient);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(json_encode($expectedResponse), $response->getContent());
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testChatReturnsErrorOnEmptyQuestion(): void
    {
        $requestData = [
            'sessionId' => 'session_test'
        ];
        $jsonContent = json_encode($requestData);

        $request = $this->createMock(Request::class);
        $request->method('getContent')->willReturn($jsonContent);

        $httpClient = $this->createMock(HttpClientInterface::class);

        $response = $this->controller->chat($request, $httpClient);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(json_encode(['error' => 'Empty question is not allowed.']), $response->getContent());
        $this->assertSame(400, $response->getStatusCode());
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testChatReturnsErrorOnException(): void
    {
        $question = [
            'messages' => [
                ['text' => 'Test question']
            ]
        ];
        $sessionId = 'session_test';
        $requestData = [
            'question' => $question,
            'sessionId' => $sessionId
        ];
        $jsonContent = json_encode($requestData);

        $request = $this->createMock(Request::class);
        $request->method('getContent')->willReturn($jsonContent);

        $this->pusher->expects($this->once())
            ->method('pushTextRequest')
            ->with($question, $sessionId)
            ->willThrowException(new \Exception('Some exception'));

        $response = $this->controller->chat($request);

        $this->assertSame(json_encode(['error' => 'Unable to contact AI agent.']), $response->getContent());
        $this->assertSame(500, $response->getStatusCode());
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testVoiceChatReturnsResponseArrayOnSuccess(): void
    {
        $sessionId = 'session_test';

        $uploadedFile = $this->createMock(UploadedFile::class);

        $request = new Request([], ['sessionId' => $sessionId], [], [], ['files' => $uploadedFile]);
        $request->files->set('files', $uploadedFile);

        $expectedResponse = ['answer' => 'Voice response'];
        $this->pusher->expects($this->once())
            ->method('pushVoiceRequest')
            ->with($uploadedFile, $sessionId)
            ->willReturn($expectedResponse);

        $response = $this->controller->voiceChat($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(json_encode($expectedResponse), $response->getContent());
    }

    /**
     * @return void
     */
    public function testVoiceChatReturnsErrorOnMissingFile(): void
    {
        $request = new Request([], ['sessionId' => 'session_test']);

        $response = $this->controller->voiceChat($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(json_encode(['error' => 'Empty voice question is not allowed.']), $response->getContent());
        $this->assertSame(400, $response->getStatusCode());
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testVoiceChatReturnsErrorOnException(): void
    {
        $sessionId = 'session_test';

        $uploadedFile = $this->createMock(UploadedFile::class);

        $request = new Request([], ['sessionId' => $sessionId]);
        $request->files->set('files', $uploadedFile);

        $this->pusher->expects($this->once())
            ->method('pushVoiceRequest')
            ->with($uploadedFile, $sessionId)
            ->willThrowException(new \Exception('Some exception'));

        $response = $this->controller->voiceChat($request);

        $this->assertSame(json_encode(['error' => 'Unable to contact AI agent.']), $response->getContent());
        $this->assertSame(500, $response->getStatusCode());
    }
}
