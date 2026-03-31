<?php

namespace App\Tests\Entity;

use App\Entity\ChatLog;
use App\ChatLogger\ChatLogStatus;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Uid\Uuid;

final class ChatLogTest extends TestCase
{
    public function testSessionSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $uuid = Uuid::v4();
        $chatLog->setSession($uuid);
        $this->assertSame($uuid, $chatLog->getSession());
    }

    public function testSenderSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $sender = 'user1';
        $chatLog->setSender($sender);
        $this->assertSame($sender, $chatLog->getSender());
    }

    public function testMessageSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $message = 'Hello world';
        $chatLog->setMessage($message);
        $this->assertSame($message, $chatLog->getMessage());
    }

    public function testCreatedAtSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $date = new \DateTimeImmutable('2024-01-01 12:00:00');
        $chatLog->setCreatedAt($date);
        $this->assertSame($date, $chatLog->getCreatedAt());
    }

    public function testUpdatedAtSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $date = new \DateTimeImmutable('2024-01-02 13:00:00');
        $chatLog->setUpdatedAt($date);
        $this->assertSame($date, $chatLog->getUpdatedAt());
    }

    public function testStatusSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $status = ChatLogStatus::SUCCESS;
        $chatLog->setStatus($status);
        $this->assertSame($status, $chatLog->getStatus());
    }

    public function testErrorSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $error = 'Some error';
        $chatLog->setError($error);
        $this->assertSame($error, $chatLog->getError());
    }

    public function testIdSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $id = 123;
        $chatLog->setId($id);
        $this->assertSame($id, $chatLog->getId());
    }

    public function testTranscribedSetterGetter(): void
    {
        $chatLog = new ChatLog();
        $this->assertFalse($chatLog->isTranscribed(), 'Default value should be false');
        $chatLog->setTranscribed(true);
        $this->assertTrue($chatLog->isTranscribed(), 'Should be true after setting to true');
        $chatLog->setTranscribed(false);
        $this->assertFalse($chatLog->isTranscribed(), 'Should be false after setting to false');
    }
}
