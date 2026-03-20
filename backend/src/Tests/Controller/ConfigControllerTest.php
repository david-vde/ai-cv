<?php

namespace App\Tests\Controller;

use App\Controller\ConfigController;
use App\Repository\ConfigRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\Exception;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use App\Entity\Config;

final class ConfigControllerTest extends TestCase
{
    private (EntityManagerInterface&MockObject)|null $entityManager;
    private (ConfigRepository&MockObject)|null $configRepository;
    private ?ConfigController $controller;


    /**
     * @return void
     * @throws Exception
     */
    protected function setUp(): void
    {
        $this->configRepository = $this->createMock(ConfigRepository::class);
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->entityManager->expects($this->any())
            ->method('getRepository')
            ->willReturnCallback(function ($entity) {
                return match ($entity) {
                    Config::class => $this->configRepository,
                    default => null,
                };
            });
        $this->controller = new ConfigController($this->entityManager);
    }

    /**
     * @return void
     */
    protected function tearDown(): void
    {
        $this->entityManager = null;
        $this->controller = null;
        $this->configRepository = null;
    }

    /**
     * Teste que getConfig retourne un JsonResponse avec le JSON sérialisé attendu
     */
    public function testGetConfigReturnsSerializedJson(): void
    {

        $mockConfigs = [new Config()];
        $this->configRepository->expects($this->once())
            ->method('findAll')
            ->willReturn($mockConfigs);

        $mockSerializer = $this->createMock(SerializerInterface::class);
        $mockSerializer->expects($this->once())
            ->method('serialize')
            ->with($mockConfigs, 'json', ['groups' => 'config:public'])
            ->willReturn('{"foo":"bar"}');

        $response = $this->controller->getConfig($mockSerializer);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame('{"foo":"bar"}', $response->getContent());
        $this->assertTrue($response->headers->contains('Content-Type', 'application/json'));
        $this->assertSame(200, $response->getStatusCode());
    }

     public function testGetConfigHandlesException(): void
    {
        $this->configRepository->expects($this->once())
            ->method('findAll')
            ->willThrowException(new \Exception('Some error'));

        $mockSerializer = $this->createMock(SerializerInterface::class);

        $mockSerializer->expects($this->never())
            ->method('serialize');

        $response = $this->controller->getConfig($mockSerializer);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(500, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('Unable to retrieve configs data.', $data['error']);
        $this->assertStringContainsString('Exception:Some error', $data['exception']);
    }
}
