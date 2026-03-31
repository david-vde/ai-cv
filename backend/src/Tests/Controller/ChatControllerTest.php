<?php

namespace App\Tests\Controller;

use App\ChatLogger\ChatLoggerInterface;
use App\Controller\ChatController;
use App\Entity\ChatLog;
use App\Webhook\QuestionPusherInterface;
use PHPUnit\Framework\MockObject\Exception;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\SerializerInterface;
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
    public function testGetChatHistoryReturnsSerializedLogsOnSuccess(): void
    {
        $sessionId = '550e8400-e29b-41d4-a716-446655440000';

        $chatLog1 = (new ChatLog())->setSender('user')->setMessage('Hello');
        $chatLog2 = (new ChatLog())->setSender('bot')->setMessage('Hi there');
        $chatLogs = [$chatLog1, $chatLog2];

        $this->logger->expects($this->once())
            ->method('history')
            ->with($sessionId)
            ->willReturn($chatLogs);

        $serializer = $this->createMock(SerializerInterface::class);
        $expectedJson = '[{"sender":"user","message":"Hello"},{"sender":"bot","message":"Hi there"}]';
        $serializer->expects($this->once())
            ->method('serialize')
            ->with($chatLogs, 'json', ['groups' => 'chatlog:public'])
            ->willReturn($expectedJson);

        $response = $this->controller->getChatHistory($serializer, $sessionId);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame($expectedJson, $response->getContent());
        $this->assertSame(200, $response->getStatusCode());
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testGetChatHistoryReturnsErrorOnException(): void
    {
        $sessionId = '550e8400-e29b-41d4-a716-446655440000';

        $this->logger->expects($this->once())
            ->method('history')
            ->with($sessionId)
            ->willThrowException(new \Exception('DB connection failed'));

        $serializer = $this->createMock(SerializerInterface::class);

        $response = $this->controller->getChatHistory($serializer, $sessionId);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(json_encode(['error' => 'Unable to retrieve history.']), $response->getContent());
        $this->assertSame(500, $response->getStatusCode());
    }
}
