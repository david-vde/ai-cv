<?php

namespace App\Tests\Controller;

use App\Controller\TranscribeController;
use App\File\DataExtractor\UploadedFileDataExtractor;
use App\Model\AudioFile;
use App\Transcriber\AudioTranscriberInterface;
use PHPUnit\Framework\MockObject\Exception;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\FileBag;
use Symfony\Component\HttpFoundation\Request;

final class TranscribeControllerTest extends TestCase
{
    private (UploadedFileDataExtractor&MockObject)|null $uploadedFileDataExtractor;
    private (AudioTranscriberInterface&MockObject)|null $audioTranscriber;
    private ?TranscribeController $controller;

    /**
     * @return void
     * @throws Exception
     */
    protected function setUp(): void
    {
        $this->uploadedFileDataExtractor = $this->createMock(UploadedFileDataExtractor::class);
        $this->audioTranscriber = $this->createMock(AudioTranscriberInterface::class);
        $this->controller = new TranscribeController($this->uploadedFileDataExtractor, $this->audioTranscriber);
    }

    /**
     * @return void
     */
    protected function tearDown(): void
    {
        $this->audioTranscriber = null;
        $this->controller = null;
        $this->uploadedFileDataExtractor = null;
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testAudioTranscribeWithValidFile(): void
    {
        $request = new Request();
        $uploadedFile = $this->createMock(UploadedFile::class);
        $audioFile = new AudioFile('/path/to/audio.webm', 'audio/webm');
        $transcriptionText = 'This is the transcribed text from audio.';

        $request->files->set('files', $uploadedFile);

        $this->uploadedFileDataExtractor
            ->expects($this->once())
            ->method('extractDataFromUploadedFile')
            ->with($uploadedFile)
            ->willReturn($audioFile);

        $this->audioTranscriber
            ->expects($this->once())
            ->method('transcribe')
            ->with($audioFile)
            ->willReturn($transcriptionText);

        $response = $this->controller->audioTranscribe($request);

        $this->assertEquals(200, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertIsArray($content);
        $this->assertArrayHasKey('transcription', $content);
        $this->assertEquals($transcriptionText, $content['transcription']);
    }

    /**
     * @return void
     */
    public function testAudioTranscribeWithMissingFile(): void
    {
        $request = new Request();
        $response = $this->controller->audioTranscribe($request);

        $this->assertEquals(400, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertIsArray($content);
        $this->assertArrayHasKey('error', $content);
        $this->assertEquals('Missing audio file.', $content['error']);
    }

    /**
     * @return void
     */
    public function testAudioTranscribeWithInvalidFileType(): void
    {
        $request = new Request();
        $fileBagMock = $this->createMock(FileBag::class);
        $fileBagMock->method('get')->willReturn('not_an_uploaded_file');
        $request->files = $fileBagMock;

        $response = $this->controller->audioTranscribe($request);

        $this->assertEquals(400, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertIsArray($content);
        $this->assertArrayHasKey('error', $content);
        $this->assertEquals('Missing audio file.', $content['error']);
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testAudioTranscribeWhenExtractionFails(): void
    {
        $request = new Request();
        $uploadedFile = $this->createMock(UploadedFile::class);
        $request->files->set('files', $uploadedFile);

        $this->uploadedFileDataExtractor
            ->expects($this->once())
            ->method('extractDataFromUploadedFile')
            ->willThrowException(new \Exception('File extraction error'));

        $response = $this->controller->audioTranscribe($request);

        $this->assertEquals(500, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertIsArray($content);
        $this->assertArrayHasKey('error', $content);
        $this->assertStringContainsString('Unable to transcribe audio', $content['error']);
        $this->assertStringContainsString('File extraction error', $content['error']);
    }

    /**
     * @return void
     * @throws Exception
     */
    public function testAudioTranscribeWhenTranscriptionFails(): void
    {
        $request = new Request();
        $uploadedFile = $this->createMock(UploadedFile::class);
        $audioFile = new AudioFile('/path/to/audio.webm', 'audio/webm');
        $request->files->set('files', $uploadedFile);

        $this->uploadedFileDataExtractor
            ->expects($this->once())
            ->method('extractDataFromUploadedFile')
            ->with($uploadedFile)
            ->willReturn($audioFile);

        $this->audioTranscriber
            ->expects($this->once())
            ->method('transcribe')
            ->willThrowException(new \Exception('Transcription service unavailable'));

        $response = $this->controller->audioTranscribe($request);

        $this->assertEquals(500, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertIsArray($content);
        $this->assertArrayHasKey('error', $content);
        $this->assertStringContainsString('Unable to transcribe audio', $content['error']);
        $this->assertStringContainsString('Transcription service unavailable', $content['error']);
    }
}
