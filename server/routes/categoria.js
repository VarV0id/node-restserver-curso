const express = require('express');
let { verificaToken, verificaAdmin_Role  } = require('../middlewares/authenticacion');
const _ = require('underscore');
let Categoria = require('../models/categoria');

let app = express();
//===============================
// Mostrar todas las categorias
//===============================
app.get('/categoria',verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Categoria.find({})
        .populate('usuario', "nombre email") //Rellena los datos del id que se referencia
        .sort('nombre') //Ordena datos por categoria
        .exec((err, categorias) => {
            Categoria.count({estado: true}, (err, conteo) => {
                return res.status(400).json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });
        });
});
//===============================
// Mostrar una categoria
//===============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.find({usuario: id}, (err, categoria) => {
       if (err){
           return res.status(500).json({
               ok: false,
               err
           });
       }
       if(categoria == null){
           return res.json({
              ok: false,
              err: {
                  message: 'El usuario no esta relacionado con ninguna categoria'
              }
           });
       }
       res.json({
           ok: true,
           categoria
       })
    });
});
//===============================
// Crear nueva categoria
//===============================
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    categoria.save((err, categoria) => {
       if(err){
           return res.status(400).json({
               ok: false,
               err
           });
       }
       res.json({
           ok: true,
           categoria: categoria
       })
    });
});
//===============================
// Actualizar categoria
//===============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    body = _.pick(req.body, 'nombre');
    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, categoriaDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
           ok: true,
           categoriaDB
        });
    });
});
//===============================
// Borrar categoria
//===============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    Categoria.findOneAndRemove(id, (err, categoriaDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
           ok: true,
           message: 'Categoria borrada correctamente',
           categoriaDB
        });
    })
});

module.exports = app;
