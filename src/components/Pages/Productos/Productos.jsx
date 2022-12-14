import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Box, Stack, Avatar, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { EditOutlined, DeleteOutline, Close } from '@mui/icons-material'
import Page from '../../common/Page'
import { Modal, Button, Row, Form, InputGroup, Col, Spinner } from 'react-bootstrap';
import CommonTable from '../../common/CommonTable'
import Swal from 'sweetalert2';

const Productos = () => {

	const [productosData, setProductosData] = useState({
		descripcion: "",
       	valorUnitarioVenta: "",
        valorUnitarioNeto: "",
        stock: "",
        stockCritico: "",
       	porcentajeGanancia: "",
        descuento: "",
        porcentajeDescuento: "",
       	imagen : "",
        idCategoria : "",
        idMarca : "",
        idProveedor : "",
        idUnidadMedida: "",
        precioCompra: "",
        idImpuesto: "",
        estado: "",
		iva: ""
	});

	const [msgErrors, setMsgErrors] = useState({
		descripcion: "",
       	valorUnitarioVenta: "",
        valorUnitarioNeto: "",
        stock: "",
        stockCritico: "",
       	porcentajeGanancia: "",
        descuento: "",
        porcentajeDescuento: "",
       	imagen : "",
        idCategoria : "",
        idMarca : "",
        idProveedor : "",
        idUnidadMedida: "",
        precioCompra: "",
        idImpuesto: "",
        estado: "",
		iva: ""
	});

	const [isError, setIsError] = useState({
		descripcion: false,
       	valorUnitarioVenta: false,
        valorUnitarioNeto: false,
        stock: false,
        stockCritico: false,
       	porcentajeGanancia: false,
        descuento: false,
        porcentajeDescuento: false,
       	imagen : false,
        idCategoria : false,
        idMarca : false,
        idProveedor : false,
        idUnidadMedida: false,
        precioCompra: false,
        idImpuesto: false,
        estado: false
	});

	const [idProducto, setIdProducto] = useState(null);
	const [getIva, setIva] = useState({
		iva: ""
	})

	const [isEdit, setIsEdit] = useState(false)
	const [listadoProductos, setListadoProductos] = useState([])
	const [proveedor, setProveedor] = useState([]);
	const [marcas, setMarcas] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [unidadMedida, setUnidadMedida] = useState([]);
	const [show, setShow] = useState(false);
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);

	const handleClose = () => {setShow(false), setIsError({
		descripcion: false,
       	valorUnitarioVenta: false,
        valorUnitarioNeto: false,
        stock: false,
        stockCritico: false,
       	porcentajeGanancia: false,
        descuento: false,
        porcentajeDescuento: false,
       	imagen : false,
        idCategoria : false,
        idMarca : false,
        idProveedor : false,
        idUnidadMedida: false,
        precioCompra: false,
        idImpuesto: false,
        estado: false	
	})};

    const handleShow = () => { setShow(true), setBotones()};
	const [listadoImpuestos, setListadoImpuestos] = useState([]);

	const init = async () => {
		const { data } = await ApiRequest().get('/listar-productos');
		setListadoProductos(data);
	}

	const obtenerImpuestos = async () => {
		const { data } = await ApiRequest().get(`/productos-impuestos`)
		setListadoImpuestos(data)
	}

	const initId = async (buscar) => {
		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/productos-filtro/${buscar}`)
			setListadoProductos(data);	
		} else {
			init()
		}
	}

	const disabledEliminarProducto = (e) => {
		if(e == 0) {
			return false;
		} return true;
	}

	const columns = [
		{ field: 'id', headerName: 'Código', width: 150 },
		{ field: 'descripcionProducto', headerName: 'Producto', width: 300 },
		{ field: 'descripcionCategoria', headerName: 'Categoría', width: 200 },
        { field: 'descripcionMarca', headerName: 'Marca', width: 200 },
		{ field: 'razonSocialProveedor', headerName: 'Razón social', width: 200 },
		{ field: 'stockProducto', headerName: 'Stock', width: 200 },
		{ field: 'stockCriticoProducto', headerName: 'Stock crítico', width: 200 },
		{ field: 'precioCompraProductoFormat', headerName: 'Precio compra', width: 150 },
		{ field: 'valorUnitarioVentaProductoFormat', headerName: 'Valor venta', width: 150 },
		{
			field: '',
			headerName: 'Acciones',
			width: 144,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={2}>
					{/**ESTE ES EL BOTON EDITAR */}
					<Button size='sm' onClick={() => {
						handleEdit(params.row);
					}}>
						<EditOutlined />
					</Button>
					<Button variant='danger' size='sm' 
					disabled={disabledEliminarProducto(params.row.stockProducto)}
					onClick={() => {
						eliminarProducto(params.row.id);
					}}>
						<DeleteOutline />
					</Button>
				</Stack>
			)
		}
	]

	const handleEdit = async (values) => {
		const { data } = await ApiRequest().get(`/productos-iva/${values.impuestoId}`);	
		setSuma({
			...suma,
			compra: values.precioCompraProducto, ganancia: values.porcentajeGananciaProducto, iva: data.tasaImpuesto, descuento: values.porcentajeDescuentoProducto
		})

		setIdProducto(values.id);

		setProductosData({
			...productosData,
		descripcion: values.descripcionProducto,
       	valorUnitarioVenta: values.valorUnitarioVentaProducto,
        valorUnitarioNeto: values.valorUnitarioNetoProducto,
        stock: values.stockProducto,
        stockCritico: values.stockCriticoProducto,
       	porcentajeGanancia: values.porcentajeGananciaProducto,
        descuento: values.descuentoProducto,
        porcentajeDescuento: values.porcentajeDescuentoProducto,
       	imagen : values.imagenProducto,
        idCategoria : values.categoriaId,
        idMarca : values.marcaId,
        idProveedor : values.proveedorId,
        idUnidadMedida: values.unidadId,
        precioCompra: values.precioCompraProducto,
        idImpuesto: values.impuestoId,
        estado: values.estadoProducto
		})
		handleShow();
		setIsEdit(true);
	}

	//todo el listado de rubros
	const listadoCategorias = async () => {
		const { data } = await ApiRequest().get(`/categorias`);
		setCategorias(data);
	}

	//todo el listado de regiones
	const listadoMarcas = async () => {
		const { data } = await ApiRequest().get('/marcas');
		setMarcas(data);
	}

	const listadoProveedor = async () => {
		const { data } = await ApiRequest().get('/listar-proveedor');
		setProveedor(data);
	}

	const listadoUnidadMedida = async () => {
		const { data } = await ApiRequest().get('/unidad-medida');
		setUnidadMedida(data);
	}

	const changeModal = () => {
		setIsEdit(false);

		setSuma({
			...suma,
			compra: 0, ganancia: 0, iva: 0, descuento: 0
		})
		
		//seteo los valores en vacio
		setProductosData({
			...productosData,
			descripcion: "",
			valorUnitarioVenta: "",
			valorUnitarioNeto: "",
			stock: "",
			stockCritico: "",
			porcentajeGanancia: "",
			descuento: "",
			porcentajeDescuento: "",
			imagen : "",
			idCategoria : "",
			idMarca : "",
			idProveedor : "",
			idUnidadMedida: "",
			precioCompra: "",
			idImpuesto: "",
			estado: "",
			iva: ""
		})
		//abro el modal
		handleShow();
	}

	//METODO PARA ELIMINAR PROVEEDOR (LA ID SE OBTIENE AL DARLE CLICK AL BASURERO)
	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/productos/${id}`)
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
	const eliminarProducto = (id) => {
		Swal.fire({
			title: '¿Estás seguro?',
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

	function setBotones () {
		setGuardando(false);
		setGuardandoHidden(true);
	}

	//ESTE METODO EDITA Y CREA PROVEEDORES
	const handleSubmit = async (e) => {
		e.preventDefault()
		setGuardando(true);
		setGuardandoHidden(false);

		//CREAR PROVEEDOR
		if(isEdit == false) {
			const { data } = await ApiRequest().post(`/productos`, productosData);
			if(data.errors == undefined) {
				//mensaje de confirmación de registro guardado
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				handleClose()
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
				setBotones();
			}
		//EDITAR PROVEEDOR
		} else {
			//aca utilizo la variable idProveedor la cual se obtiene al editar 
			const { data } = await ApiRequest().put(`/productos/${idProducto}`, productosData);
			if(data.errors == undefined) {
				//mensaje de confirmación de registro guardado
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				handleClose()
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
				setBotones();
			}
		}	
	}

	//efecto para mostrar los combo box
    useEffect(()=> {
		listadoCategorias();
		listadoMarcas();
		listadoProveedor();
		listadoUnidadMedida();
		obtenerImpuestos();
    },[]);
	//efecto para mostrar cambios en el data table
	useEffect(init, [])

	const obtenerIva = async (value) => {
		const { data } = await ApiRequest().get(`/productos-iva/${value}`);

		setSuma({
			...suma,
			iva: data.tasaImpuesto
		})
		setProductosData({
			...productosData,
			iva: data.tasaImpuesto
		})
	}

	const [suma, setSuma] = useState({compra: 0, ganancia: 0, iva: 0, descuento: 0})

	useEffect(()=>{
		const {compra, ganancia, descuento, iva} = suma
		setProductosData({
			...productosData,
			valorUnitarioVenta: Math.trunc((((Number((compra * (ganancia - descuento)) / 100) + Number(compra)) * Number(iva)) / 100) +
			Number((compra * (ganancia - descuento)) / 100) + Number(compra), -1),
			valorUnitarioNeto: Math.ceil(Number((compra * (ganancia - descuento)) / 100) + Number(compra))
		})	

		
	}, [suma])

	return (
		<>
		<Dialog maxWidth='md' fullWidth open={show}>
				<DialogTitle>
					<IconButton aria-label="close"
						onClick={handleClose}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close></Close>
					</IconButton>
						{isEdit ? 'Editar producto' : 'Agregar producto'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate onSubmit={handleSubmit}>
					<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formDescripcion">
											<Form.Label>Producto</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un descripción producto"
														value={productosData.descripcion}
														onChange={e => {
															(setProductosData({
																...productosData,
																descripcion: e.target.value
															})
															), 
															setIsError({...isError, descripcion: false})}
															}
														isInvalid={isError.descripcion}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.descripcionError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formCategoria">
											<Form.Label>Categoría</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Categoria"
													value={productosData.idCategoria}
													onChange={e => {
														(setProductosData({
															...productosData,
															idCategoria: e.target.value
														})
														), 
														setIsError({...isError, idCategoria: false})}
														}
													isInvalid={isError.idCategoria}>
											<option hidden value={0}>Seleccione una categoría</option>
											{
												categorias.map((item, index) => (
													<option value={item.id} key={index}>{item.descripcionCategoria}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.idCategoriaError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formRubro">
											<Form.Label>Unidad de medida</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Unidad medida"
														value={productosData.idUnidadMedida}
														onChange={e => {
															(setProductosData({
															...productosData,
															idUnidadMedida: e.target.value
															})
														), setIsError({...isError, idUnidadMedida: false})}
														}
														isInvalid={isError.idUnidadMedida}>
											<option hidden value={0}>Seleccione una unidadad de medida</option>
											{
												unidadMedida.map((item, index) => (
													<option value={item.id} key={index}>{item.descripcionUnidadMedida}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.idUnidadMedidaError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
							
										<Form.Group as={Col} md="6" controlId="formMarca">
											<Form.Label>Marca</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Marca"
													value={productosData.idMarca}
													onChange={e => {
														(setProductosData({
															...productosData,
															idMarca: e.target.value
														})
														), 
														setIsError({...isError, idMarca: false})}
														}
													isInvalid={isError.idMarca}>
											<option hidden value={0}>Seleccione una marca</option>
											{
												marcas.map((item, index) => (
													<option value={item.id} key={index}>{item.descripcionMarca}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.idMarcaError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formRubro">
											<Form.Label>Proveedor</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Proveedor"
														value={productosData.idProveedor}
														onChange={e => {
															(setProductosData({
															...productosData,
															idProveedor: e.target.value
															})
														), setIsError({...isError, idProveedor: false})
														}
														}
														isInvalid={isError.idProveedor}>
											<option hidden value={0}>Seleccione un proveedor</option>
											{
												proveedor.map((item, index) => (
													<option value={item.id} key={index}>{item.nombreProveedor}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.idProveedorError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="form">
											<Form.Label>Stock crítico</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese stock crítico del producto"
														value={productosData.stockCritico}
														onChange={e => {
															(setProductosData({
																...productosData,
																stockCritico: e.target.value
															})
															), 
															setIsError({...isError, stockCritico: false})}
															}
														isInvalid={isError.stockCritico}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.stockCriticoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>

									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="12" controlId="formRubro">
											<Form.Label>Impuesto</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Impuestos"
														value={productosData.idImpuesto}
														onChange={e => {
															(setProductosData({
															...productosData,
															idImpuesto: e.target.value
															})
														), setIsError({...isError, idImpuesto: false}),
														obtenerIva(e.target.value)
														}
														}
														isInvalid={isError.idImpuesto}>
											<option hidden value={0}>Seleccione un tipo de impuesto</option>
											{
												listadoImpuestos.map((item, index) => (
													<option value={item.id} key={index}>{item.descripcionImpuesto}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.idImpuestoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formValorUnitario">
											<Form.Label>Valor unitario neto</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un valor unitario neto"
														value={productosData.valorUnitarioNeto}
														disabled
														onChange={e => {
															(setProductosData({
																...productosData,
																valorUnitarioNeto: e.target.value
																})
															), 
															setIsError({...isError, valorUnitarioNeto: false})}
															}
														isInvalid={isError.valorUnitarioNeto}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.valorUnitarioNetoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>

										
										<Form.Group as={Col} md="6" controlId="formDescripcion">
											<Form.Label>Precio compra</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="number" 
														placeholder="Ingrese precio de compra"
										
														value={productosData.precioCompra}
														onChange={e => {
															(setProductosData({
																...productosData,
																precioCompra: e.target.value
															}),
															setIsError({...isError, precioCompra: false}),
																setSuma({
																	...suma,
																	compra: e.target.value
																})
															)}
															}
														isInvalid={isError.precioCompra}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.precioCompraError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
						
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formValorUnitarioVenta">
											<Form.Label>Valor unitario venta</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="number" 
													placeholder="Ingrese valor unitario venta"
													value={productosData.valorUnitarioVenta}
													
													onChange={e => {
															(setProductosData({
															...productosData,
															valorUnitarioVenta: e.target.value
															})
														), 
														setIsError({...isError, valorUnitarioVenta : false})}
														}
													isInvalid={isError.valorUnitarioVenta}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.valorUnitarioVentaError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										
										<Form.Group as={Col} md="6" controlId="formCorreo">
											<Form.Label>% de ganancia</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="number" 
														placeholder="Ingrese porcentaje de ganacia"
														value={productosData.porcentajeGanancia}
														onChange={e => {
															(setProductosData({
																...productosData,
																porcentajeGanancia: e.target.value
															}),
															setIsError({...isError, porcentajeGanancia: false}),
																setSuma({
																	...suma,
																	ganancia: e.target.value
																})
															)}
															}
														isInvalid={isError.porcentajeGanancia}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.porcentajeGananciaError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formRazonSocial">
											<Form.Label>Descuento</Form.Label>
												<InputGroup hasValidation>
													<Form.Control type="number" 
															placeholder="Ingrese descuento"
															value={productosData.porcentajeDescuento}
															onChange={e => {
																(setProductosData({
																...productosData,
																porcentajeDescuento: e.target.value
																}),
																setSuma({
																	...suma,
																	descuento: e.target.value
																})
																), 
																setIsError({...isError, porcentajeDescuento: false})}										
																}
															isInvalid={isError.porcentajeDescuento}/>
												<Form.Control.Feedback type="invalid">
														{msgErrors.porcentajeDescuentoError}
													</Form.Control.Feedback>
												</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formRazonSocial">
											<Form.Label>Porcentaje IVA</Form.Label>
												<InputGroup hasValidation>
													<Form.Control type="text" 
															placeholder="Ingrese descuento"
															disabled
															value={suma.iva}
															onChange={e => {
																(setSuma({
																...suma,
																iva: e.target.value
																})
																), 
																setIsError({...isError, razonSocial: false})}										
																}
															isInvalid={isError.razonSocial}/>
												<Form.Control.Feedback type="invalid">
														{msgErrors.razonSocialError}
													</Form.Control.Feedback>
												</InputGroup>
										</Form.Group>
									</Row>
						<DialogActions>
							<Button variant="secondary" onClick={handleClose}>
								Cerrar
							</Button>
							<Button variant="primary" 
							type='submit'
							hidden={guardando}>
								Guardar
							</Button>
							<Button variant="primary" hidden={guardandoHidden} disabled={guardando}>
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
				

			<Page title="YUYITOS | productos">
			
				<Container maxWidth='xl'>
					<Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de productos</Typography>
					</Box>
					
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={9}>
									<Button variant="primary" onClick={changeModal}>
									Nuevo Productos
									</Button>
								</Col>
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>								
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoProductos} columns={columns} autoHeight={false}/>
						</Grid>
						</Grid>
				</Container>
			</Page>
		</>
	)
}

export default Productos;