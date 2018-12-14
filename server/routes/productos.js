const express = require('express');

const { verificaToken } = require('../middlewares/authenticacion');

const _ = require('underscore');

let app = express();
let Producto = require('../models/producto');

//=======================
// Obtener productos
//=======================
app.get('/producto', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Producto.find({disponible: true})
        .sort('nombre')
        .populate('usuario')
        .populate('categoria', 'nombre')
        .limit(limite)
        .skip(desde)
        .exec((err, productosDB) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
               ok: true,
               productosDB
            });
        });
});
//=========================
// Obtener producto por ID
//=========================
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.find(id)
        .populate('usuario')
        .populate('categoria')
        .exec((err, productoDB) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productoDB
            });
        });
});
//=======================
// Buscar productos
//=======================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if(err){
                return res.status(500).json({
                   ok: false,
                   err
                });
            }
            res.json({
               ok: true,
               productos
            });
        });
});
//=========================
// Crear producto
//=========================
app.post('/producto', verificaToken,(req, res) => {
    let body = req.body;
    let user = req.usuario._id;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: user
    });
    producto.save((err, productoDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            productoDB
        });
    });
});
//=========================
// Actualizar producto
//=========================
app.put('/producto/:id', (req, res) => {
    let id = req.params.id;
    body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion',  'categoria', 'usuario']);
    Producto.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productoDB) => {
       if(err){
           return res.status(400).json({
               ok: false,
               err
           });
       }
        res.json({
            ok: true,
            productoDB
        });
    });
});
//=========================
// Borrar producto
//=========================
app.delete('/producto/:id', (req, res) => {
    let id = req.params.id;
    let cambiaDisponibilidad = {
        disponible: false
    };
    Producto.findByIdAndUpdate(id, cambiaDisponibilidad, (err, productoBorrado) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Producto no encontrado"
                }
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado
        })
    });
});

module.exports = app;
