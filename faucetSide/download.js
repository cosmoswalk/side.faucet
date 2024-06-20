import express from 'express';
import { readdir, createReadStream } from 'fs';
import { promisify } from 'util';
import { join, resolve } from 'path';

const app = express();
const port = 5055; // Можете выбрать любой порт, который вам подходит

const readdirAsync = promisify(readdir);


const downloadFolderPath = resolve('/mobile.dev/back');

app.get('/files', async (req, res) => {
  try {
    const files = await readdirAsync(downloadFolderPath);
    res.json(files);
  } catch (error) {
    res.status(500).send('Ошибка при получении списка файлов.');
  }
});

app.get('/files/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = join(downloadFolderPath, filename);

  createReadStream(filePath)
    .on('error', () => res.status(404).send('Файл не найден.'))
    .pipe(res);
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
