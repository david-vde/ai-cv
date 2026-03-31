<?php

namespace App\Tests\Utils;

use App\Utils\ObjectUtils;
use PHPUnit\Framework\TestCase;

final class ObjectUtilsTest extends TestCase
{
    /**
     * @return void
     * @throws \ReflectionException
     */
    public function testSetPrivatePropertyValue(): void
    {
        $object = new class {
            private string $name = 'initial';
        };

        ObjectUtils::setPrivatePropertyValue($object, 'name', 'updated');

        $this->assertSame('updated', ObjectUtils::getPrivatePropertyValue($object, 'name'));
    }

    /**
     * @return void
     * @throws \ReflectionException
     */
    public function testSetPrivatePropertyValueOnReadonlyProperty(): void
    {
        $object = (new \ReflectionClass(TestClassWithReadOnlyProperty::class))->newInstanceWithoutConstructor();

        ObjectUtils::setPrivatePropertyValue($object, 'name', 'updated');

        $this->assertSame('updated', ObjectUtils::getPrivatePropertyValue($object, 'name'));
    }

    /**
     * @return void
     * @throws \ReflectionException
     */
    public function testGetPrivatePropertyValue(): void
    {
        $object = new class {
            private int $age = 42;
        };

        $value = ObjectUtils::getPrivatePropertyValue($object, 'age');

        $this->assertSame(42, $value);
    }

    /**
     * @return void
     * @throws \ReflectionException
     */
    public function testSetPrivatePropertyValueThrowsOnInvalidProperty(): void
    {
        $object = new class {};

        $this->expectException(\ReflectionException::class);

        ObjectUtils::setPrivatePropertyValue($object, 'nonExistent', 'value');
    }

    /**
     * @return void
     * @throws \ReflectionException
     */
    public function testGetPrivatePropertyValueThrowsOnInvalidProperty(): void
    {
        $object = new class {};

        $this->expectException(\ReflectionException::class);

        ObjectUtils::getPrivatePropertyValue($object, 'nonExistent');
    }
}

/** @noinspection PhpMultipleClassesDeclarationsInOneFile */
readonly class TestClassWithReadOnlyProperty {
    public function __construct(private string $name)
    {
    }
}
