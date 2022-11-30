import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { EditOutlined, DeleteOutline, Close, Search, Add, WindowSharp, RemoveRedEyeSharp, PictureAsPdf } from '@mui/icons-material'
import Page from '../../common/Page'
import CommonTable from '../../common/CommonTable'
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import { renderToString } from "react-dom/server";
import autoTable from 'jspdf-autotable';
import { Modal, Button, Row, Form, InputGroup, Col, Spinner, Table } from 'react-bootstrap';

const Preventa = () => {

	// window.onbeforeunload = function() {
	// 	return "¿Desea recargar la página web?";
	// };

	const [isError, setIsError] = useState({
		cantidad: false
	});

	const [msgErrors, setMsgErrors] = useState({
		cantidadError: ""
	});

	const [idPreventa, setIdPreventa] = useState();
	const [suma, setSuma] = useState({cantidad: 0, precio: 0})
    const [show, setShow] = useState(false);
	const [showListado, setShowListado] = useState(false);
    const handleClose = () => {setShow(false), setFormulario(), setBotones()};
    const handleShow = () => {setShow(true), setFormulario(), setBotones()};
    const [buscarProductosModal, setBuscarProductosModal] = useState(false);
    const handleShowBuscarProducto = () => {setBuscarProductosModal(true), obtenerProductosBodega()};
    const handleCloseBuscarProducto = () => {setBuscarProductosModal(false)};
	const handeShowListadoPreventas = () => {setShowListado(true), obtenerPreventasGeneradas()};
	const handleCloseListadoPreventas = () => {setShowListado(false)};
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);
	const [generando, setGenerando] = useState(false);
	const [generandoHidden, setGenerandoHidden] = useState(true);
	const [disabledGenerando, setDisabledGenerando] = useState(true);
	const [borrando, setBorrando] = useState(false);
	const [borrandoHidden, setBorrandoHidden] = useState(true);
    const [listadoProductos, setListadoProductos] = useState([]);
	const [listadoPreventa, setListadoPreventa] = useState([]);
	const [listadoPreventaPendientes, setListadoPreventaPendientes] = useState([]);
	const [totalesPreventa, setTotalesPreventa] = useState({
		id: "",
		total: "",
		neto: "",
		iva: "",
		usuario: ""
	});
    const [producto, setProducto] = useState({
        id: "",
        codigo: "",
        precioUnitario: "",
        stock: "",
        categoria: "",
        unidadMedida: "",
        iva: "",
        total: "",
        cantidad: ""
    })

    const obtenerProductosBodega = async () => {
		const { data } = await ApiRequest().get('/bodega-productos');
		setListadoProductos(data);
	}

	const columnsPreventa = [
		{ field: 'productoId', headerName: 'Código producto', width: 300 },
		{ field: 'productoId', headerName: 'Descripción producto', width: 300 },
        { field: 'valorUnitarioPreventa', headerName: 'Valor unitario', width: 300 },
		{ field: 'cantidadPreventa', headerName: 'Cantidad', width: 300 },
		{ field: 'total', headerName: 'Total', width: 300 },
		//estas son las acciones del data table
		{
			field: '',
			headerName: 'Acciones',
			width: 265,
			//params son los parametros del data table
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={2}>
					<Button variant="danger" size='sm' onClick={() => {
						//función para eliminar (recupero la id del data table)
						eliminarProductoPreventa(params.row.id, params.row.productoId, params.row.preventaId);
					}}>
						<DeleteOutline />
					</Button >
				</Stack>
			)
		}
	]

	const obtenerPreventasGeneradas = async () => {
		const { data } = await ApiRequest().get(`/preventa/${0}`);
		setListadoPreventaPendientes(data);
	}

	const eliminarProductoPreventa= (id, producto, preventa) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar esta preventa?!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Eliminar!'
		}).then((result) => {
			if (result.isConfirmed) {
				confirmarEliminacionProducto(id, producto, preventa);
			}
		})		
	}

	const confirmarEliminacionProducto = async (id, producto, preventa) => {
		const { data } = await ApiRequest().delete(`/preventa-eliminar-producto/${id}/${producto}`);
		Swal.fire({
			position: 'center',
			icon: 'success',
			title: data.message,
			showConfirmButton: true,
			timer: 2500
		})  
		listadoDePreventaTotales(preventa);
		listadoDePreventa(preventa)
	}

    const columnsProductos = [
        { field: 'codigoBarra', headerName: 'Código de barra', width: 200 },
		{ field: 'idProducto', headerName: 'Código producto', width: 150 },
		{ field: 'nombreProducto', headerName: 'Producto', width: 200 },
		{ field: 'cantidadBodega', headerName: 'Cantidad', width: 100 },
		//estas son las acciones del data table
		{
			field: '',
			headerName: 'Acciones',
			width: 144,
			//params son los parametros del data table
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={2}>
					<Button size='sm' onClick={() => {
						buscarProducto(params.row);
					}}>
						<Add />
					</Button>
				</Stack>
			)
		}
	]

	const descargarPdf = async (id) => {

		const { data } =  await ApiRequest().get(`/preventa-detalles-total/${id}`);
		//console.log(data)

		const rowsDetalles = [];
		const datos = await ApiRequest().get(`/preventa-detalles/${id}`);
		datos.data.map(item=> (rowsDetalles.push(item)))

		console.log(rowsDetalles)


		let doc = new jsPDF("p", "px", [250, 480]); 

		doc.setDrawColor(0, 0, 0);
		doc.setLineWidth(2);
		doc.roundedRect(15, 400, 220, 60, 5, 5);
		doc.setFontSize(12);
		doc.text("PREVENTA N°",90, 30);
		doc.text(renderToString(data.preventaId), 155, 30);
		doc.text("ALMACÉN YUYITOS",85, 50);

		doc.roundedRect(15, 80, 220, 310, 5, 5);
		doc.autoTable({
		columns:[
				{ header: 'Descripción producto', dataKey: 'nombreProducto'},
				{ header: 'Cantidad', dataKey: 'cantidadPreventa'},
				{ header: 'Total', dataKey: 'total'},
			],

		body:rowsDetalles,
		  	margin:{top:80, horizontal: 20},
			theme: "plain",
		
		})
		doc.setDrawColor(0, 0, 0);
		doc.setLineWidth(2);
		doc.roundedRect(15, 10, 220, 60, 5, 5);
		doc.setFontSize(12);
		doc.text("INFORMACIÓN VENDEDOR",65, 420);

		window.open(doc.output('bloburl'))	
	}

	const columnsPreventasPendientes = [
		{ field: 'preventaId', headerName: 'N°', width: 100 },
		{ field: 'nombreUsuario', headerName: 'Vendedor', width: 200 },
		{ field: 'totalIvaPreventaFormat', headerName: 'Total iva', width: 150 },
        { field: 'totalNetoPreventaFormat', headerName: 'Total neto', width: 150 },
		{ field: 'totalFormat', headerName: 'Total', width: 150 },
		{ field: 'fechaPreventa', headerName: 'Fecha', width: 200 },
		//estas son las acciones del data table
		{
			field: '',
			headerName: 'Acciones',
			width: 200,
			//params son los parametros del data table
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={4}>
					<Button variant="info" size='sm' onClick={() => {
						
					}}>
						<RemoveRedEyeSharp />
					</Button >
					<Button variant="primary" size='sm' onClick={() => {
						descargarPdf(params.row.preventaId)
					}}>

						<PictureAsPdf/>
					</Button>
					<Button variant="success" size='sm' onClick={() => {
						//función para eliminar (recupero la id del data table)
						listadoDePreventa(params.row.preventaId);
						listadoDePreventaTotales(params.row.preventaId);
						setIdPreventa(params.row.preventaId);
						handleCloseListadoPreventas();
					}}>
						<Add />
					</Button >

					
				</Stack>
			)
		}
	]

    const buscarProducto = async (row) => {
        const { data } = await ApiRequest().get(`/productos/${row.idProducto}`);
        setProducto({
            ...producto,
            id: data.id,
            codigo: row.codigoBarra,
            precioUnitario: data.valorUnitarioVentaProducto,
            stock: row.cantidadBodega,
            categoria: data.descripcionCategoria,
            unidadMedida: data.descripcionUnidad,
            iva: data.porcentajeIva,
            total: data.valorUnitarioVentaProducto,
            cantidad: 1
        })
		setSuma({
			...suma,
			precio: data.valorUnitarioVentaProducto,
			cantidad: 1
		})	
		handleCloseBuscarProducto();
    }

    const changeModal = () => {
        handleShow();
    }

	const listadoDePreventa = async (id) => {
		const { data } = await ApiRequest().get(`/preventa-detalles/${id}`);
		setListadoPreventa(data);	
	}

	const setFormulario = () => {
		setProducto({
            ...producto,
            id: "",
            codigo: "",
            precioUnitario: "",
            stock: "",
            categoria: "",
            unidadMedida: "",
            iva: "",
            total: "",
            cantidad: ""
        })
		setSuma({
			...suma,
			precio: "",
			cantidad: ""
		})	
	}

	const listadoDePreventaTotales = async (id) => {
		const { data } = await ApiRequest().get(`/preventa-detalles-total/${id}`);
		setTotalesPreventa({
			...totalesPreventa,
			id: data.id,
			total: data.total,
			neto: data.totalNetoPreventa,
			iva: data.totalIvaPreventa,
			usuario: data.nombreUsuario
		});	
	}

	function setBotones () {
		setGuardando(false);
		setGuardandoHidden(true);
	}

    const handleSubmit = async (e) => {
		e.preventDefault();
		setGuardando(true);
		setGuardandoHidden(false);
		if(idPreventa == undefined) {
			const { data } = await ApiRequest().post(`/preventa`, producto);
			console.log(data)
			if(data.errors == undefined) {
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				setIdPreventa(data.resultado.response);	
				listadoDePreventa(data.resultado.response);
				listadoDePreventaTotales(data.resultado.response);
				setDisabledGenerando(false);
				handleClose()
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
				setBotones();
			}	
		} else {
			const { data } = await ApiRequest().post(`/preventa-detalles/${idPreventa}`, producto);	

			if(data.errors == undefined) {
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})

				listadoDePreventa(idPreventa);
				listadoDePreventaTotales(idPreventa);
				setDisabledGenerando(false);
				setDisabledGenerando(false);
				handleClose()
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
				setBotones();
			}	
		}
		
    }

	const eliminarPreventa= () => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar esta preventa?!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Eliminar!'
		}).then((result) => {
			if (result.isConfirmed) {
				confirmarEliminacion(idPreventa);
			}
		})		
	}

	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/preventa-eliminar/${id}`);
		Swal.fire({
			position: 'center',
			icon: 'success',
			title: data.message,
			showConfirmButton: true,
			timer: 2500
		})
		setListadoPreventa([]);
		setTotalesPreventa({
			id: "",
			total: "",
			neto: "",
			iva: "",
			usuario: ""
		})
	}

	const confirmarPreventa = async (id) => {
		const { data } = await ApiRequest().post(`/preventa-generar/${id}`);
		Swal.fire({
			position: 'center',
			icon: 'success',
			title: data.message,
			showConfirmButton: true,
			timer: 2500
		})
		setListadoPreventa([]);
		setTotalesPreventa({
			id: "",
			total: "",
			neto: "",
			iva: "",
			usuario: ""
		})
	}

	const generarPreventa= () => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas generar esta preventa?!",
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Aceptar!'
		}).then((result) => {
			if (result.isConfirmed) {
				confirmarPreventa(idPreventa);
			}
		})		
	}

	const initBuscarProducto= async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/bodega-productos-filtro/${buscar}`)
			setListadoProductos(data);	
		} else {
			obtenerProductosBodega()
		}
	}

	useEffect(()=>{
		const {cantidad, precio} = suma
		setProducto({
			...producto,
			total: (cantidad * precio)
		})
	}, [suma])

    return(
        <>
			<Dialog maxWidth='lg' fullWidth open={showListado}>
				<DialogTitle>
				<IconButton aria-label="close"
						onClick={handleCloseListadoPreventas}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close></Close>
					</IconButton>
						Listado de preventas pendientes
				</DialogTitle>
				<hr />
				<DialogContent>
				<Grid container spacing={2}>
				<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={8}>

								</Col>
								<Col  xl={4}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initBuscarProducto(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>
					<Grid item xs={12} sm={12}>
					<CommonTable data={listadoPreventaPendientes} columns={columnsPreventasPendientes} autoHeight={true}/>
					</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button variant='secondary' color='primary' onClick={handleCloseListadoPreventas}>Cerrar</Button>
				</DialogActions>
			</Dialog>

            <Dialog maxWidth='md' fullWidth open={buscarProductosModal}>
				<DialogTitle>
					Búsqueda de productos preventa
				</DialogTitle>
				<hr />
				<DialogContent>
				<Grid container spacing={2}>
				<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initBuscarProducto(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>
					<Grid item xs={12} sm={12}>
					<CommonTable data={listadoProductos} columns={columnsProductos} autoHeight={true}/>
					</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button variant='secondary' color='primary' onClick={handleCloseBuscarProducto}>Cerrar</Button>
				</DialogActions>
			</Dialog>
            <Dialog maxWidth='lg' fullWidth open={show}>
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
						{'Agregar producto'}
				</DialogTitle>
				<hr />
				<DialogContent>
                <Form noValidate onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="formDescripcion">
							<Form.Label>Código barra</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="text" 
									placeholder="Ingrese un código de barra"
									disabled
									value={producto.codigo}
								/>
								<Form.Control.Feedback type="invalid">
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
                        <Form.Group as={Col} md="2" controlId="formRut">
							<Form.Label></Form.Label>
							<InputGroup hasValidation>
								<DialogActions>
								<Button variant="primary" position='center' 
                                onClick={handleShowBuscarProducto}
								>
								<Search />
									Buscar
								</Button>
								</DialogActions>
								</InputGroup>
							</Form.Group>
                        <Form.Group as={Col} md="4" controlId="formDescripcion">
							<Form.Label>Código producto</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="text" 
									placeholder="Código de producto"
                                    disabled
									value={producto.id}
								/>
								<Form.Control.Feedback type="invalid">
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
                        </Row>   
                        <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="formDescripcion">
							<Form.Label>Precio unitario</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="number" 
									placeholder="Precio unitario (iva inc)"
                                    disabled
									value={producto.precioUnitario}
								/>
								<Form.Control.Feedback type="invalid">
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
                        <Form.Group as={Col} md="6" controlId="formDescripcion">
							<Form.Label>Stock disponible</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="number" 
									placeholder="Stock disponible"
                                    disabled
									value={producto.stock}
								/>
								<Form.Control.Feedback type="invalid">
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
                        </Row> 
                        <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="formDescripcion">
							<Form.Label>Categoría</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="text" 
									placeholder="Categoría de producto"
                                    disabled
									value={producto.categoria}
								/>
								<Form.Control.Feedback type="invalid">
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
                        <Form.Group as={Col} md="6" controlId="formDescripcion">
							<Form.Label>Unida de medida</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="text" 
									placeholder="Unidad de medida producto"
                                    disabled
									value={producto.unidadMedida}
								/>
								<Form.Control.Feedback type="invalid">
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
                        </Row> 
                        <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="formDescripcion">
							<Form.Label>Total (iva inc)</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="number" 
									placeholder="Total iva inc"
                                    disabled
									value={producto.total}
									onChange={e => {
										(setSuma({
											...suma,
											precio: e.target.value
										}))
										}
									}
								/>
								<Form.Control.Feedback type="invalid">
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
                        <Form.Group as={Col} md="2" controlId="formDescripcion">
							<Form.Label>% Iva</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="number" 
									placeholder="Iva"
                                    disabled
									value={producto.iva}
								/>
								<Form.Control.Feedback type="invalid">
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
                        <Form.Group as={Col} md="4" controlId="formDescripcion">
							<Form.Label>Cantidad</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="number" 
									placeholder="Ingrese una cantidad"
									value={suma.cantidad}
									onChange={e=>{ 
									(setProducto({...producto, cantidad: e.target.value})), 
									(setSuma({...suma, cantidad: e.target.value}))}		   
									}
									isInvalid={isError.cantidad}/>
								<Form.Control.Feedback type="invalid">
									{msgErrors.cantidadError}
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
							hidden={guardando}
							> Guardar
							</Button>
							{/* BOTON GUARDANDO*/}
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
        <Page title="YUYITOS | preventa">
				<Container maxWidth='xl'>
					<Box sx={{ pb: 5 }}>
						<Typography variant="h5">Preventas</Typography>
					</Box>
					<Grid container spacing={2}>
						<Grid item>
							<Button variant="primary" onClick={changeModal}>
								Agregar producto
							</Button>
						</Grid>
						<Grid item>
							<Button variant="info" onClick={handeShowListadoPreventas}>
								Buscar preventa
							<Search />
							</Button>	
						</Grid>			
						
					{/**DATA TABLE */}
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoPreventa} columns={columnsPreventa} autoHeight={false}/>
						</Grid>  
                        <Grid item xs={12} sm={12}>
                            <hr />
                            <Form.Label><h5>Total de preventa</h5></Form.Label>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
										<th>N° Preventa</th>
										<th>Total</th>
										<th>Neto</th>
										<th>Iva</th>
										<th>Nombre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    <tr>
                                        <td>{totalesPreventa.id}</td>
                                        <td>{totalesPreventa.total}</td>
                                        <td>{totalesPreventa.neto}</td>  
										<td>{totalesPreventa.iva}</td>
                                        <td>{totalesPreventa.usuario}</td>  
                                    </tr>
                                }
                                </tbody>
                            </Table>
                        </Grid>
                        <Grid item xs={8} sm={8}></Grid>
                        <Grid item xs={4} sm={4}>
							{/**BOTON PARA ABRIR MODAL */}
                            <Row md={10}>
								<Col  sm={4}>
                                    <Button variant="danger"
										disabled={disabledGenerando} 
										hidden={borrando}
										onClick={eliminarPreventa}
									>
                                        Eliminar
                                    </Button>
									<Button variant="danger" hidden={borrandoHidden} disabled={borrando}>
									<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
									/> ..Eliminando
									</Button>
                                </Col>
                                <Col  sm={6}>
                                  <Button variant="primary" 
                                    type='submit'
									hidden={generando}
									disabled={disabledGenerando}
									onClick={generarPreventa}
									>
                                    Generar preventa
							    </Button>  
								<Button variant="primary" hidden={generandoHidden} disabled={generando}>
								<Spinner
								as="span"
								animation="border"
								size="sm"
								role="status"
								aria-hidden="true"
								/> ..Guardando
								</Button>
                                </Col>
                            </Row>			
						</Grid>
					</Grid>
				</Container>
			</Page>
        </>
    )
}

export default Preventa;