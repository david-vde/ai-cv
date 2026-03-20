<?php

namespace App\Tests\Entity;

use PHPUnit\Framework\TestCase;
use App\Entity\Config;

final class ConfigTest extends TestCase
{
    public function testIdGetterAndSetter(): void
    {
        $config = new Config();
        $this->assertNull($config->getId());
        $config->setId(42);
        $this->assertSame(42, $config->getId());
    }

    public function testNameGetterAndSetter(): void
    {
        $config = new Config();
        $this->assertNull($config->getName());
        $config->setName('test_name');
        $this->assertSame('test_name', $config->getName());
    }

    public function testDataGetterAndSetter(): void
    {
        $config = new Config();
        $this->assertNull($config->getData());
        $config->setData('test_data');
        $this->assertSame('test_data', $config->getData());
    }
}
