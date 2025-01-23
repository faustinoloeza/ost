const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs'); // Importar el módulo fs para manejar archivos
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors());

const port = 5000;

// Configura AWS SDK
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const random = Math.floor(Math.random() * 1000);
    const params = {
        Bucket: 'hotelshopsdata',
        Key: random + file.originalname,
        Body: require('fs').createReadStream(file.path),
        ACL: 'public-read' // Opcional: si quieres que el archivo sea público
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al subir el archivo' });
        }

        // Eliminar el archivo de la carpeta uploads/ después de subirlo
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error('Error al eliminar el archivo:', err);
                return res.status(500).json({ error: 'Error al eliminar el archivo local' });
            }

            console.log('Archivo local eliminado:', file.path);
            res.json({ message: 'Archivo subido con éxito', location: data.Location });
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});