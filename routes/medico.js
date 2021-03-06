var express = require('express');

var middlewareAuth = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ===================================
// Obtener todos los medicos
// ===================================
app.get('/', function(req, res, next) {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            function(err, medicos) {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }
                Medico.count({}, function(err, conteo) {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        totalMedicos: conteo
                    });
                });
            }
        );
});

// ===================================
//  Actualizar medico
// ===================================
app.put('/:id', middlewareAuth.verificaToken, function(req, res) {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, function(err, medico) {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save(function(err, medicoGuardado) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });
});

// ===================================
// Crear un nuevo medico
// ===================================
app.post('/', middlewareAuth.verificaToken, function(req, res) {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save(function(err, medicoGuardado) {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

// ===================================
//  Borrar medico por id
// ===================================
app.delete('/:id', middlewareAuth.verificaToken, function(req, res) {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, function(err, medicoBorrado) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: { message: 'No existe medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});

module.exports = app;