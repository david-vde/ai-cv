<?php

namespace App\Controller;

use App\Entity\Config;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[AsController]
readonly class ConfigController
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    #[Route('/api/config', name: 'api_config', methods: ['GET'])]
    public function getConfig(SerializerInterface $serializer): JsonResponse
    {
        try {
            $allConfigs = $this->entityManager->getRepository(Config::class)->findAll();

            $json = $serializer->serialize(
                $allConfigs,
                'json',
                ['groups' => 'config:public']
            );

            return new JsonResponse($json, 200, [], true);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Unable to retrieve configs data.',
                'exception' => 'Exception:' . $e->getMessage()
            ], 500);
        }
    }
}
