<?php

namespace App\ChatLogger;

use App\Entity\ChatLog;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

readonly class DatabaseChatLogger implements ChatLoggerInterface
{
    /**
     * @param EntityManagerInterface $entityManager
     */
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    /**
     * @param string $sender
     * @param string $message
     * @param string $sessionUuid
     * @param ChatLogStatus $status
     * @param string|null $error
     * @param bool $transcribed
     * @return void
     */
    public function log(
        string $sender,
        string $message,
        string $sessionUuid,
        ChatLogStatus $status = ChatLogStatus::SUCCESS,
        string $error = null,
        bool $transcribed = false): void
    {
        $chatLog = (new ChatLog())
            ->setSender($sender)
            ->setMessage($message)
            ->setSession(new Uuid($sessionUuid))
            ->setStatus($status)
            ->setError($error)
            ->setTranscribed($transcribed)
        ;

        $this->entityManager->persist($chatLog);
        $this->entityManager->flush();
    }

    /**
     * @param string $sessionUuid
     * @param bool $includeErrors
     * @return array<ChatLog>
     */
    public function history(string $sessionUuid, bool $includeErrors = false): array
    {
        $criteria = ['session' => new Uuid($sessionUuid)];

        if (!$includeErrors) {
            $criteria['status'] = ChatLogStatus::SUCCESS;
        }

        return $this->entityManager->getRepository(ChatLog::class)->findBy($criteria);
    }
}
