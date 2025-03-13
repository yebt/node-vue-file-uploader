const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with UUID
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});


// File size limit (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// Database to store file information (In-memory for simplicity)
const fileDatabase = [];

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Api Files',
  })
})
app.get('/api/files', (req, res) => {
  res.json({
    ok: true,
    message: 'Api Files',
  })
})

app.post('/api/files/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      id: path.basename(req.file.filename, path.extname(req.file.filename)),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date()
    };

    fileDatabase.push(fileInfo);
    res.status(200).json(fileInfo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
})

app.get('/api/files/list', (req, res) => {
  res.json(fileDatabase);
});


app.get('/api/files/download/:id', (req, res) => {

  const fileId = req.params.id;
  const fileInfo = fileDatabase.find(file => file.id === fileId);

  if (!fileInfo) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  const filePath = path.join(uploadsDir, fileInfo.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
  }

  res.download(filePath, fileInfo.originalName);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`Compartiendo archivos en tu red local (LAN)`);
  
  // Display server IP addresses
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  console.log('\nDirecciones IP disponibles:');
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`http://${net.address}:${PORT}`);
      }
    }
  }
});
