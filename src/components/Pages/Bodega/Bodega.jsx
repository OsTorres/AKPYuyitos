import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Box, Stack, Avatar, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { EditOutlined, DeleteOutline, Close, Search, Add } from '@mui/icons-material'
import Page from '../../common/Page'
import { Modal, Button, Row, Form, InputGroup, Col, Table, Spinner } from 'react-bootstrap';
import CommonTable from '../../common/CommonTable'
import Swal from 'sweetalert2';

const Bodega = () => {

	const [msgErrors, setMsgErrors] = useState({
		numeroLoteError: "",
		fechaVencimientoError: "",
		idProductoError: "",
		cantidadError: "",
		codigoError: "",
		numeroProductoError: "",
		oobservacionesError: ""
	});

	const [isError, setIsError] = useState({
		numeroLote: false,
		fechaVencimiento: false,
		idProducto: false,
		cantidad: false,
		codigo: false,
		numeroProducto: false,
		oobservaciones: false
	});

	const [detalleOrdenCompra, setDetalleOrdenCompra] = useState([]);
	const [bodegaProducto, setBodegaProducto] = useState({
		numeroLote: "",
		fechaVencimiento: "",
		idProducto: "",
		cantidad: "",
		codigo: "",
		numeroProducto: "",
		oobservaciones: "",
		nombreProducto: ""
	})

	const [idProveedor, setIdProveedor] = useState(null);
	const [idOrden, setIdOrden] = useState();
	const [isEdit, setIsEdit] = useState(false)
	const [show, setShow] = useState(false);
	const [ordenNoDisponible, setOrdenNoDisponible] = useState(true);
	const [showConfirmarIngreso, setShowConfirmarIngreso] = useState(false);
	const handleClose = () => {setShow(false)};
	const [listadoProductosBodega, setListadoProductosBodega] = useState([]);
	const [previsualizacion, setPrevisualizacion] = useState([]);
	const [agregando, setAgregando] = useState(false);
	const [agregandoHidden, setAgregandoHidden] = useState(true);
	const [showEdit, setShowEdit] = useState(false);
    const handleShow = () => {setShow(true), resetIngresoFormulario(), setCambios(false)};
	const [showCancelarCambios, setShowCancelarCambios] = useState(false);
	const handleShowCancelarCambios = () => {if(cambios){setShowCancelarCambios(true)} else {setShow(false)}};
	const handleCloseCancelarCambios = () => setShowCancelarCambios(false);
	const handleShowEdit = () => {setShowEdit(true), setBotonesEdit(), setErrorMsg()};
	const handleCloseEdit = () => setShowEdit(false);

	const init = async () => {
		const { data } = await ApiRequest().get('/bodega-productos');
		setListadoProductosBodega(data);
	}

	const initId = async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/bodega-productos-filtro/${buscar}`)
			setListadoProductosBodega(data);	
		} else {
			init()
		}
	}

	const setErrorMsg = () => {
		setIsError({
			...isError,
			numeroLote: false,
			fechaVencimiento: false,
			idProducto: false,
			cantidad: false,
			codigo: false,
			numeroProducto: false,
			oobservaciones: false
		})
		setMsgErrors({
			...msgErrors,
			numeroLoteError: "",
			fechaVencimientoError: "",
			idProductoError: "",
			cantidadError: "",
			codigoError: "",
			numeroProductoError: "",
			oobservacionesError: ""
		})
	}

	//en field debe ir el nombre de la columna (OJO--> TAL CUAL COMO SE LLAMA EN SU ALIAS)
	const columns = [
		{ field: 'idProducto', headerName: 'Código producto', width: 150 },
		{ field: 'idOrden', headerName: 'Número de orden', width: 150 },
		{ field: 'nombreProducto', headerName: 'Producto', width: 200 },
		{ field: 'codigoBarra', headerName: 'Código de barra', width: 200 },
        { field: 'numeroLote', headerName: 'Número de lote', width: 200 },
		{ field: 'cantidadBodega', headerName: 'Cantidad', width: 100 },
		{ field: 'fechaVencimiento', headerName: 'Fecha de vencimiento', width: 200 },
		
		
		//estas son las acciones del data table
		{
			field: '',
			headerName: 'Acciones',
			width: 144,
			//params son los parametros del data table
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={2}>
					<Button size='sm' onClick={() => {
						handleEdit(params.row);
					}}>
						<EditOutlined />
					</Button>
					<Button variant='danger' disabled={verificarStock(params.row.cantidadBodega)} size='sm' onClick={() => {
						eliminarProveedor(params.row.id);
					}}>
						<DeleteOutline />
					</Button>
				</Stack>
			)
		}
	]

	const verificarStock = (value) => {
		if(value == 0) {
			return false;
		} return true;
	}

	const handleEdit = (values) => {

		handleShowEdit();
		setBodegaProducto({
			...bodegaProducto,
			numeroLote: values.numeroLote,
			fechaVencimiento: values.fechaVencimientoFormat,
			idProducto: values.idProducto,
			cantidad: values.cantidadBodega,
			codigo: values.codigoBarra,
			numeroProducto: values.id,
			oobservaciones: "",
			nombreProducto: values.nombreProducto
		})
		//seteo el editar en true
		setIsEdit(true);
	}

	const setFormularios = () => {
		setBodegaProducto({
			...bodegaProducto,
			numeroLote: "",
			fechaVencimiento: "",
			idProducto: "",
			cantidad: "",
			codigo: "",
			numeroProducto: "",
			oobservaciones: ""
		})
	}

	const changeModal = () => {
		setFormularios()
		setIsEdit(false);
		handleShow();
	}

	//METODO PARA ELIMINAR PROVEEDOR (LA ID SE OBTIENE AL DARLE CLICK AL BASURERO)
	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/bodega/eliminar/${id}`)
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: data.message,
				showConfirmButton: true,
				timer: 2500
			})
		init();
	}

	//mensaje de eliminacion si se presiona el boton eliminar ejecuta la función de arriba que cambia el estado de un proveedor
	const eliminarProveedor = (id) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar este producto?!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Eliminar!'
		}).then((result) => {
			if (result.isConfirmed) {
				confirmarEliminacion(id);
			}
		})	
		
	}

	function setBotonesEdit () {
		setModificando(false);
		setModificandoHidden(true);
	}

	//ESTE METODO EDITA Y CREA PROVEEDORES
	const handleSubmitEdit = async (e) => {
		e.preventDefault()
		setModificando(true);
		setModificandoHidden(false);
		
			//aca utilizo la variable idProveedor la cual se obtiene al editar 
			const { data } = await ApiRequest().put(`/bodega/modificar-producto/${bodegaProducto.numeroProducto}`, bodegaProducto);
			if(data.errors == undefined) {
				//mensaje de confirmación de registro guardado
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				handleCloseEdit()
				init()	
			} else {
				//listado de errores
				let errors = []
				let msg = []
				data.errors.map((item)=> {
					errors.push([item.param, true])
					msg.push([item.param+'Error', item.msg])
				});	

				const objError = Object.fromEntries(errors);
				const objMsg = Object.fromEntries(msg);
				setIsError(objError);
				setMsgErrors(objMsg);		
			}
			
			setBotonesEdit();
	}

	const finalizarIngreso = async (value) => {
		handleClose()
		if(value == 3) {
			const { data } = await ApiRequest().put(`/orden-compra/estado/${idOrden}`, Object.assign({estadoOrden: 3}, {oobservaciones: bodegaProducto.oobservaciones}));
			Swal.fire({
				position: 'center',
				icon: 'info',
				title: 'Orden de compra aprobada',
				showConfirmButton: true,
				timer: 2500
			})
		} else {
			const { data } = await ApiRequest().put(`/orden-compra/estado/${idOrden}`, Object.assign({estadoOrden: 2}, {oobservaciones: bodegaProducto.oobservaciones}));
			Swal.fire({
				position: 'center',
				icon: 'info',
				title: 'Orden de compra rechazada',
				showConfirmButton: true,
				timer: 2500
			})
		}
		setShowConfirmarIngreso(false)
		init();
	}

	const buscarProductosOrdenCompra = async (vld) => {
		const { data } = await ApiRequest().get(`/detalle-orden-compra-validar/${idOrden}`)
		if(data.length == 0 && vld == 'validar') {
			setMsgErrors({...msgErrors, numeroProductoError: 'Orden de compra no encontrada'})
			setIsError({...isError, numeroProducto: true})	
		} else {
			if(data.errors == undefined) {
				setDetalleOrdenCompra(data)
				previsualizarIngreso();
				setOrdenNoDisponible(true)
				setOrdenNoDisponible(false)
			} else {
				setMsgErrors({...msgErrors, numeroProductoError: data.errors[0].msg})
				setIsError({...isError, numeroProducto: true})		
			}	
		}
	}

	const buscarDetalleProducto = async (value) => {
		if(value == 'id') {
			const { data } = await ApiRequest().get(`/cantidad-producto-detalle/${idOrden}/${bodegaProducto.numeroProducto}`)
			setBodegaProducto({
				...bodegaProducto,
				cantidad: data.cantidad,
				idProducto: data.idProducto
			})		
		} else {
			const { data } = await ApiRequest().get(`/cantidad-producto-detalle/${idOrden}/${value}`)
			setBodegaProducto({
				...bodegaProducto,
				numeroProducto: value,
				cantidad: data.cantidad,
				idProducto: data.idProducto
			})	
		}	
	}

	function setBotones () {
		setAgregando(false);
		setAgregandoHidden(true);
	}

	const agregarProductoBodega = async () => {
		setAgregando(true);
		setAgregandoHidden(false);
		const { data } = await ApiRequest().post(`/bodega/crear-producto/${idOrden}`, bodegaProducto)
		if(data.errors == undefined) {
			previsualizarIngreso(idOrden)
			buscarProductosOrdenCompra('noValidar');
			setFormularios();	
			setCambios(true);		
		} else {
			let errors = []
			let msg = []
			data.errors.map((item)=> {
				errors.push([item.param, true])
				msg.push([item.param+'Error', item.msg])
			});	

			const objError = Object.fromEntries(errors);
			const objMsg = Object.fromEntries(msg);
			setIsError(objError);
			setMsgErrors(objMsg);
		}
		setBotones();		
	}

	const eliminarProductoBodega = async (id, producto, idOrdenCompra) => {
		let datos =  {
			idBodega: id,
			idProducto: producto
		}
		const { data } = await ApiRequest().post(`/bodega/eliminar-producto/${idOrdenCompra}`, datos)
		previsualizarIngreso(idOrden)
		buscarProductosOrdenCompra('noValidar');
	}

	const previsualizarIngreso = async () => {
		const { data } = await ApiRequest().get(`/bodega-productos/${idOrden}`)
		setPrevisualizacion(data)
	}

	const [cambios, setCambios] = useState(false);
	const [modificando, setModificando] = useState(false);
	const [modificandoHidden, setModificandoHidden] = useState(true);

	const resetIngresoFormulario = () => {
		setDetalleOrdenCompra([]);
		setPrevisualizacion([]);
		setIdOrden();
		setOrdenNoDisponible(true);	
	}

	const cancelarCambiosIngreso = async () => {

		const { data } = await ApiRequest().delete(`/bodega/eliminar-listado/${idOrden}`)	
		resetIngresoFormulario();
		setShowCancelarCambios(false);
		setShow(false);
	}

	const [disabledCantidad, setDisabledCantidad] = useState(true);

	useEffect(init, [])

	return (
		<>
			<Dialog maxWidth='xs' open={showConfirmarIngreso}>
				<DialogTitle>
					{isEdit ? '¿Desea cerrar la edición?' : '¿Desea ingresar la orden de compra?'}
				</DialogTitle>
				<DialogContent>	
					<Typography variant='h5'>
						Al aceptar los productos serán ingresados
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button variant="secondary" onClick={e=> setShowConfirmarIngreso(false)}>cancelar</Button>
					<Button variant='primary'  onClick={e=> finalizarIngreso(3)}>aceptar</Button>
				</DialogActions>
			</Dialog>

			<Dialog maxWidth='xs' open={showCancelarCambios}>
				<DialogTitle>
					{'¿Desea cancelar el ingreso de productos?'}
				</DialogTitle>
				<DialogContent>	
					<Typography variant='h5'>
						Al aceptar se perderan los cambios
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button variant="secondary" onClick={handleCloseCancelarCambios}>cancelar</Button>
					<Button variant='primary'  onClick={cancelarCambiosIngreso}>aceptar</Button>
				</DialogActions>
			</Dialog>

			<Dialog maxWidth='md' fullWidth open={showEdit}>
				<DialogTitle>
					<IconButton aria-label="close"
						onClick={handleCloseEdit}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close></Close>
					</IconButton>
						{'Modificar producto bodega'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate onSubmit={handleSubmitEdit}>
					<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formRut">
											<Form.Label>Código Producto</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un rut"
														value={bodegaProducto.idProducto}
														disabled/>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formNombre">
											<Form.Label>Nombre producto</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
													placeholder="Ingrese un nombre"
													value={bodegaProducto.nombreProducto}
													disabled/>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formTelefono1">
											<Form.Label>Código de barra</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
													placeholder="Ingrese una cantidad de stock"
													value={bodegaProducto.codigo}
													onChange={e => {
															(setBodegaProducto({
															...bodegaProducto,
															codigo: e.target.value
															})
														), 
														setIsError({...isError, codigo: false})}
														}
													isInvalid={isError.codigo}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.codigoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>

										<Form.Group as={Col} md="6" controlId="formTelefono2">
											<Form.Label>Número de lote</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un número de teléfono 2"
														value={bodegaProducto.numeroLote}
														onChange={e => {
															(setBodegaProducto({
																...bodegaProducto,
																numeroLote: e.target.value
															})
															), 
															setIsError({...isError, numeroLote: false})}
															}
														isInvalid={isError.numeroLote}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.numeroLoteError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formCorreo">
											<Form.Label>Fecha de vencimiento</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="date" 
														placeholder="Ingrese una fecha"
														value={bodegaProducto.fechaVencimiento}
														onChange={e => {
															(setProveedorData({
																...proveedorData,
																correo: e.target.value
															})
															), 
															setIsError({...isError, fechaVencimiento: false})}
															}
														isInvalid={isError.fechaVencimiento}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.fechaVencimientoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formCantidad">
											<Form.Label>Cantidad lote</Form.Label>
												<InputGroup hasValidation>
													<Form.Control type="text" 
															placeholder="Ingrese una cantidad"
															value={bodegaProducto.cantidad}
															onChange={e => {
																(setBodegaProducto({
																...bodegaProducto,
																cantidad: e.target.value
																})
																), 
																setIsError({...isError, cantidad: false})}										
																}
															isInvalid={isError.cantidad}/>
												<Form.Control.Feedback type="invalid">
														{msgErrors.cantidadError}
													</Form.Control.Feedback>
												</InputGroup>
										</Form.Group>
										
									</Row>
						<DialogActions>
							<Button variant="secondary" onClick={handleCloseEdit}>
								Cerrar
							</Button>
							<Button variant="primary" 
							type='submit' 
							hidden={modificando}
							> Guardar
							</Button>
							{/* BOTON GUARDANDO*/}
							<Button variant="primary" hidden={modificandoHidden} disabled={modificando}>
							<Spinner
							as="span"
							animation="border"
							size="sm"
							role="status"
							aria-hidden="true"
							/> ..Guardando
							</Button>
						</DialogActions>
					</Form>
				</DialogContent>
			</Dialog>	

			<Dialog maxWidth='md' fullWidth open={show}>
				<DialogTitle>
					<IconButton aria-label="close"
						onClick={handleShowCancelarCambios}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close></Close>
					</IconButton>
						{'Ingresar productos a bodega'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate>
						<Row className="mb-3">
							<Form.Group as={Col} md="10" controlId="formRut">
								<Form.Label>Número de orden de compra</Form.Label>
									<InputGroup hasValidation>
									<Form.Control type="text" 
												placeholder="Ingrese número de orden de compra"
												//value={proveedorData.rut}
												onChange={e => { 
													setIdOrden(e.target.value)
													setIsError({...isError, numeroProducto: false})}
												}
												isInvalid={isError.numeroProducto}/>
									<Form.Control.Feedback type="invalid">
												{msgErrors.numeroProductoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="2" controlId="formNombre">
										<Form.Label></Form.Label>
											<InputGroup hasValidation>
												<DialogActions>
													<Button variant="primary" onClick={e=> buscarProductosOrdenCompra('validar')}>
													Buscar
												</Button>
												</DialogActions>
											</InputGroup>		
										</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="12" controlId="formRut">
									<Form.Label><h5>Productos de orden de compra</h5></Form.Label>
									<Table striped bordered hover>
									<thead>
										<tr>
										<th>Nombre producto</th>
										<th>Cantidad</th>
										<th>Producto</th>
										<th>Agregar</th>
										</tr>
									</thead>
									<tbody>			
									{
										detalleOrdenCompra.map((orden, index) => (
											<tr key={index}>
												<td>{orden.nombreProducto}</td>
												<td>{orden.cantidad}</td>
												<td>{orden.id}</td>
												<td><Button variant='success' size='sm' onClick={() => {
													buscarDetalleProducto(orden.id), setIsError({isError, idProducto: false})	
												}}>
													<Add />
												</Button></td>
											</tr>
										))
									}	
									</tbody>
									</Table>
									</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Label><h5>Formulario de ingreso</h5></Form.Label>
										<Form.Group as={Col} md="6" controlId="formCorreo">
											<Form.Label>N° Producto</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="número de producto"
														value={bodegaProducto.numeroProducto}
														//readOnly={ordenNoDisponible}
														disabled
														onChange={e => {
															(setBodegaProducto({
																...bodegaProducto,
																numeroProducto: e.target.value
															})
															), 
															setIsError({...isError, idProducto: false})}
															}
														isInvalid={isError.idProducto}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.idProductoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formCorreo">
											<Form.Label>Código producto</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Número de producto"
														value={bodegaProducto.idProducto}
														disabled
														onChange={e => {
															(setBodegaProducto({
																...bodegaProducto,
																idProducto: e.target.value
															})
															), 
															setIsError({...isError, idProducto: false})}
															}
														isInvalid={isError.idProducto}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.idProductoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formCorreo">
											<Form.Label>Código de barra</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un correo"
														value={bodegaProducto.codigo}
														disabled={ordenNoDisponible}
														onChange={e => {
															(setBodegaProducto({
																...bodegaProducto,
																codigo: e.target.value
															})
															), 
															setIsError({...isError, codigo: false})}
															}
														isInvalid={isError.codigo}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.codigoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>

										<Form.Group as={Col} md="6" controlId="formCorreo">
											<Form.Label>Número de lote</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un correo"
														value={bodegaProducto.numeroLote}
														disabled={ordenNoDisponible}
														onChange={e => {
															(setBodegaProducto({
																...bodegaProducto,
																numeroLote: e.target.value
															})
															), 
															setIsError({...isError, numeroLote: false})}
															}
														isInvalid={isError.numeroLote}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.numeroLoteError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formCorreo">
											<Form.Label>Fecha de vencimiento</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="date" 
														placeholder="Ingrese un correo"
														value={bodegaProducto.fechaVencimiento}
														disabled={ordenNoDisponible}
														onChange={e => {
															(setBodegaProducto({
																...bodegaProducto,
																fechaVencimiento: e.target.value
															})
															), 
															setIsError({...isError, fechaVencimiento: false})}
															}
														isInvalid={isError.fechaVencimiento}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.fechaVencimientoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="2" controlId="formRazonSocial">
											<Form.Label>Cantidad</Form.Label>
												<InputGroup hasValidation>
													<Form.Control type="text" 
															placeholder=""
															value={bodegaProducto.cantidad}
															disabled={disabledCantidad}
															onChange={e => {(
																	setBodegaProducto({
																		...bodegaProducto,
																		cantidad: e.target.value
																	})
																),
																setIsError({...isError, cantidad: false})}										
																}
															isInvalid={isError.cantidad}/>
												<Form.Control.Feedback type="invalid">
														{msgErrors.cantidadError}
													</Form.Control.Feedback>
												</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="2" controlId="formRazonSocial">
											<Form.Label>¿Modificar?</Form.Label>
												<InputGroup hasValidation>
													<Form.Check type="switch" 
															disabled={ordenNoDisponible}
															onChange={e => {
																	if(e.target.checked) {
																		setDisabledCantidad(false)
																	} else {
																		setDisabledCantidad(true)
																	}	
																
																setIsError({...isError, razonSocial: false})}										
																}
															isInvalid={isError.razonSocial}/>
												<Form.Control.Feedback type="invalid">
														{msgErrors.razonSocialError}
													</Form.Control.Feedback>
												</InputGroup>
										</Form.Group>

										<Form.Group as={Col} md="2" controlId="formNombre">
										<Form.Label></Form.Label>
											<InputGroup hasValidation>
										<DialogActions>
											<Button variant="primary" onClick={agregarProductoBodega}
											disabled={ordenNoDisponible}
											hidden={agregando}>										
											  Agregar
											</Button>
											<Button variant="primary" hidden={agregandoHidden} disabled={agregando}>
											<Spinner
											as="span"
											animation="border"
											size="sm"
											role="status"
											aria-hidden="true"
											/> ..Agregando
											</Button>
										</DialogActions></InputGroup>		
										</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="12" controlId="formRut">
									<Form.Label><h5>Productos ingresados en orden n° {idOrden}</h5></Form.Label>
									<Table striped bordered hover>
									<thead>
										<tr>
										<th>Nombre producto</th>
										<th>Cantidad</th>
										<th>Código producto</th>
										<th>Eliminar</th>
										</tr>
									</thead>
									<tbody>
									
									{
										previsualizacion.map((previ, index) => (
											<tr key={index}>
												<td>{previ.nombreProducto}</td>
												<td>{previ.cantidadBodega}</td>
												<td>{previ.idProducto}</td>
												<td><Button variant='danger' size='sm' onClick={() => {
													eliminarProductoBodega(previ.id, previ.idProducto, previ.idOrden)
													
												}}>
													<DeleteOutline />
												</Button></td>
											</tr>
										))
									}	
									
									</tbody>
									</Table>
									</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="12" controlId="formCorreo">
											<Form.Label>Observaciones de orden de pedido</Form.Label>
											<InputGroup hasValidation>
											<Form.Control as="textarea" rows={3}
														placeholder="Ingrese las observaciones"
														value={bodegaProducto.oobservaciones}
														onChange={e => {
															(setBodegaProducto({
																...bodegaProducto,
																oobservaciones: e.target.value
															})
															), 
															setIsError({...isError, correo: false})}
															}
														isInvalid={isError.correo}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.correoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									
						<DialogActions>
							<Button variant="secondary" onClick={
								handleShowCancelarCambios
							}>
								Cerrar
							</Button>
							<Button variant="danger" onClick={e => finalizarIngreso(2)} disabled={ordenNoDisponible}>
								Rechazar
							</Button>
							<Button variant="success" onClick={e=> setShowConfirmarIngreso(true)} disabled={ordenNoDisponible}>
								Ingresar
							</Button>
						</DialogActions>
					</Form>
				</DialogContent>
			</Dialog>	

			<Page title="YUYITOS | proveedores">
			
				<Container maxWidth='xl'>
					<Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de productos de bodega</Typography>
					</Box>
					
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={9}>
									<Button variant="primary" onClick={changeModal}>
									Ingresar orden de compra
									</Button>
								</Col>
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>										
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoProductosBodega} columns={columns} autoHeight={false}/>
						</Grid>
					</Grid>
				</Container>
			</Page>
		</>
	)
}

export default Bodega;
