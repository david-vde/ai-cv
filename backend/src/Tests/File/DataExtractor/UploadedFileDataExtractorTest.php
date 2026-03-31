<?php

namespace App\Tests\File\DataExtractor;

use App\File\DataExtractor\UploadedFileDataExtractor;
use PHPUnit\Framework\MockObject\Exception;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class UploadedFileDataExtractorTest extends TestCase
{
    private ?UploadedFileDataExtractor $extractor;

    /**
     * @return void
     */
    protected function setUp(): void
    {
        $this->extractor = new UploadedFileDataExtractor();
    }

    /**
     * @return void
     */
    protected function tearDown(): void
    {
        $this->extractor = null;
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testExtractDataFromUploadedFileWithValidWebmFile(): void
    {
        $uploadedFile = $this->createMock(UploadedFile::class);
        $movedFile = $this->createMock(File::class);

        $uploadedFile->expects($this->once())->method('guessExtension')->willReturn('webm');

        $uploadedFile
            ->expects($this->once())
            ->method('move')
            ->with(sys_get_temp_dir(), 'audio.webm')
            ->willReturn($movedFile);

        $movedFile->expects($this->once())->method('getPathname')->willReturn('/tmp/audio.webm');
        $movedFile->expects($this->once())->method('getMimeType')->willReturn('audio/webm');

        $result = $this->extractor->extractDataFromUploadedFile($uploadedFile);

        $this->assertSame('/tmp/audio.webm', $result->fileName);
        $this->assertSame('audio/webm', $result->mimeType);
    }
}
