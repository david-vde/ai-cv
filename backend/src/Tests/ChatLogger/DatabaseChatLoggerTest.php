<?php

namespace App\Tests\ChatLogger;

use App\ChatLogger\DatabaseChatLogger;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use App\Entity\ChatLog;
use App\ChatLogger\ChatLogStatus;
use Symfony\Component\Uid\Uuid;

final class DatabaseChatLoggerTest extends TestCase
{
    private (EntityManagerInterface&MockObject)|null $entityManager;
    private ?DatabaseChatLogger $databaseChatLogger;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->databaseChatLogger = new DatabaseChatLogger($this->entityManager);
    }

    protected function tearDown(): void
    {
        $this->entityManager = null;
        $this->databaseChatLogger = null;
    }

    public function testLogPersistsChatLogEntity(): void
    {
        $sender = 'user';
        $message = 'Hello world';
        $sessionUuid = Uuid::v4()->toRfc4122();
        $status = ChatLogStatus::SUCCESS;
        $error = null;

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($this->callback(function ($entity) use ($sender, $message, $sessionUuid, $status, $error) {
                return $entity instanceof ChatLog
                    && $entity->getSender() === $sender
                    && $entity->getMessage() === $message
                    && $entity->getSession()->toRfc4122() === $sessionUuid
                    && $entity->getStatus() === $status
                    && $entity->getError() === $error;
            }));
        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->databaseChatLogger->log($sender, $message, $sessionUuid, $status, $error);
    }
}
