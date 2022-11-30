import React, {useEffect, useState} from "react";
import { TextField, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, 
	Container, Typography, Grid, Box, Stack, Avatar, IconButton, Divider, Select, MenuItem } from '@mui/material';
import { EditOutlined, DeleteOutline, Close, Search, Add, WindowSharp, RemoveRedEyeSharp } from '@mui/icons-material'
import ApiRequest from '../../../helpers/axiosInstances'
import Page from '../../common/Page';
import ToastAutoHide from '../../common/ToastAutoHide';
import CommonTable from '../../common/CommonTable';
import Swal from 'sweetalert2';
import { Modal, Button, Row, Form, InputGroup, Col, Spinner, Table } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import { renderToString } from "react-dom/server";
import autoTable from 'jspdf-autotable';
import { PDFObject } from "react-pdfobject";
import imagesList from '../../../assets/';
import { Redirect } from 'react-router-dom'


const Caja = (props) => {

	const [isError, setIsError] = useState({
		cantidad: false
	});

	const [msgErrors, setMsgErrors] = useState({
		cantidadError: ""
	});

	const [disabledTipoPago, setDisabledTipoPago] = useState(false);
	const [disabledPagadoEfectivo, setDisabledPagadoEfectivo] = useState(false)
	const [disabledPagadoTarjeta, setDisabledPagadoTarjeta] = useState(true)
	const [idPreventa, setIdPreventa] = useState();
	const [suma, setSuma] = useState({cantidad: 0, precio: 0});
	const [pagadoCaja, setPagadoCaja] = useState({pagado: 0, total: 0, realizar: 0, vuelto: 0, iva: 0, neto: 0, tarjeta: 0, fiado: 0});
    const [show, setShow] = useState(false);
	const [showListado, setShowListado] = useState(false);
	const [showClientes, setShowClientes] = useState(false);
	const handleShowModalClientes = () => {setShowClientes(true), obtenerListadoClientes()};
	const handleCloseModalClientes = () => {setShowClientes(false)};
    const handleClose = () => {setShow(false), setFormulario(), setBotones()};
    const handleShow = () => {setShow(true), setFormulario(), setBotones()};
    const [buscarProductosModal, setBuscarProductosModal] = useState(false);
    const handleShowBuscarProducto = () => {setBuscarProductosModal(true), obtenerProductosBodega()};
    const handleCloseBuscarProducto = () => {setBuscarProductosModal(false)};
	const handeShowListadoPreventas = () => {setShowListado(true), obtenerPreventasGeneradas()};
	const handleCloseListadoPreventas = () => {setShowListado(false)};
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [disabledFiado, setDisabledFidado] = useState(true);
	const [disabledPagado, setDisabledPagado] = useState(false);
	const [guardando, setGuardando] = useState(false);
	const [generando, setGenerando] = useState(false);
	const [generandoHidden, setGenerandoHidden] = useState(true);
	const [disabledGenerando, setDisabledGenerando] = useState(true);
	const [borrando, setBorrando] = useState(false);
	const [borrandoHidden, setBorrandoHidden] = useState(true);
    const [listadoProductos, setListadoProductos] = useState([]);
	const [listadoPreventa, setListadoPreventa] = useState([]);
	const [listadoClientes, setListadoClientes] = useState([]);
	const [listadoDocumentos, setListadoDocumentos] = useState([]);
	const [listadoTipoPago, setListadoTipoPago] = useState([]);
	const [listadoPreventasGeneradas, setListadoPreventasGeneradas] = useState([]);
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
	const [ventaData, setVentaData] = useState({
		idCliente: "",
		nombreCliente: "",
		rutCliente: "",
		idTipoPago: "",
		idTipoDocumento: "",
		vuelto: "",
		pagado: "",
		total: "",
		iva: "",
		neto: "",
		fechaPago: ""	
	})

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
		setPagadoCaja({
			...pagadoCaja,
			pagado: 0, total: 0, realizar: 0, vuelto: 0, iva: 0, neto: 0, tarjeta: 0, fiado: 0});
	}

	const setFormularioVenta = () => {

		setVentaData({
			...ventaData,
			idCliente: "",
			nombreCliente: "",
			rutCliente: "",
			idTipoPago: "",
			idTipoDocumento: "",
			vuelto: "",
			pagado: "",
			total: "",
			iva: "",
			neto: "",
			fechaPago: ""
		})
		setDisabledPagadoEfectivo(false);	
		setDisabledPagadoTarjeta(true);
		setDisabledTipoPago(false);
		setListadoDocumentos([]);
		setListadoTipoPago([]);
		setTotalesPreventa([]);
		setListadoPreventa([]);
		obtenerTipoDocumento();
		obtenerTipoPago();
			
	}

	function setBotones () {
		setGuardando(false);
		setGuardandoHidden(true);
	}

	const obtenerProductosBodega = async () => {
		const { data } = await ApiRequest().get('/bodega-productos');
		setListadoProductos(data);
	}

	const obtenerPreventasGeneradas= async () => {
		const { data } = await ApiRequest().get(`/preventa/${1}`);
		setListadoPreventasGeneradas(data);
	}

	const obtenerListadoClientes = async () => {
		const { data } = await ApiRequest().get(`/listar-cliente`);
		setListadoClientes(data)
	}

	// combo box caja
	const obtenerTipoPago = async () => {
		const { data } = await ApiRequest().get(`/tipos-pagos`);
		setListadoTipoPago(data)
	}

	const obtenerTipoDocumento = async () => {
		const { data } = await ApiRequest().get(`/tipos-documentos`);
		setListadoDocumentos(data)
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

	const columnsPreventa = [
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

	const limpiarVentaCaja = () => {

		if(listadoPreventa.length > 0) {
			Swal.fire({
				title: '¿Estas seguro?',
				text: "¿Deseas eliminar esta venta?!",
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Eliminar!'
			}).then((result) => {
				if (result.isConfirmed) {
					setFormularioVenta();
				} 
			})	
		}
		
	}

	const eliminarProductoPreventa = (id, producto, preventa) => {
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

    const columns = [
		{ field: 'productoId', headerName: 'Código producto', width: 300 },
		{ field: 'productoId', headerName: 'Descripción producto', width: 300 },
        { field: 'valorUnitarioPreventa', headerName: 'Valor unitario', width: 300 },
		{ field: 'cantidadPreventa', headerName: 'Cantidad', width: 300 },
		{ field: 'total', headerName: 'Total', width: 300 },
		{
			field: '',
			headerName: 'Acciones',
			width: 200,
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

	const columnsCliente = [
        { field: 'runCliente', headerName: 'Run', width: 200 },
        { field: 'nombreCliente', headerName: 'Nombre', width: 200 },
        { field: 'apellidoCliente', headerName: 'Apellido', width: 200 },
        { field: 'emailCliente', headerName: 'Correo', width: 200 },
        { field: 'telefonoCliente', headerName: 'Teléfono', width: 200 },
		{
			field: '',
			headerName: 'Acciones',
			width: 134,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} 
                justifyContent="center" alignItems="center" spacing={4}>
					<Button size='sm' variant="success" onClick={() => {
						console.log(params)
						handleCloseModalClientes();
						setVentaData({...ventaData,
							idCliente: params.row.id,
							rutCliente: params.row.runCliente,
							nombreCliente: (params.row.nombreCliente)+' '+(params.row.apellidoCliente)
						})
					}}>
						<Add />
					</Button>
				</Stack>
			)
		}
	]


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
		
		setPagadoCaja({...pagadoCaja, total: data.total, iva: data.totalIvaPreventa, neto: data.totalNetoPreventa})
	}

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

	const listadoDePreventa = async (id) => {
		const { data } = await ApiRequest().get(`/preventa-detalles/${id}`);
		setListadoPreventa(data);	
	}

	const initIdCliente = async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/cliente/${buscar}`)
			setListadoClientes(data);	
		} else {
			obtenerListadoClientes() 
		}
	}

	const initBuscarPreventa = async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/preventa-filtro/${buscar}`)
			setListadoPreventasGeneradas(data);	
		} else {
			obtenerPreventasGeneradas() 
		}
	}

	const generarPdf =  async (id) => {

		const { data } = await ApiRequest().get(`/listar-ventas/${id}`);

		console.log(data)

		const rowsDetalles = [];
		const datos = await ApiRequest().get(`/listar-detalles-venta/${id}`);
		datos.data.map(item=> (rowsDetalles.push(item)))

		let doc = new jsPDF('p','pt','a4');
		let img = new Image();
		img.src = imagesList.yuyitosLogo
		doc.addImage(img, 40, 35, 120, 70);
		doc.setFontSize(14);
		

		doc.text(40, 25, "Documento de venta");
		doc.setFont("arial", "title");
		doc.setFontSize(14);
		doc.setLineWidth(2);
		doc.setDrawColor(0, 0, 0);
		doc.line(30, 30, 560, 30);

		doc.setFont("arial");
		doc.setDrawColor(255, 0, 0);
		doc.rect(350, 35, 210, 90);
		doc.setFontSize(12);
		doc.text("11111111-1", 420, 55);
		//doc.text("FACTURA ELECTRONICA:", 380, 80);
		if(data.tipoDocumento == 'Fiado'){
			doc.text((renderToString(data.tipoDocumento)).toUpperCase(), 430, 80);
		}else{
			doc.text((renderToString(data.tipoDocumento)+' ELECTRÓNICA').toUpperCase(), 385, 80);
		}
		
		doc.text(renderToString(data.id), 435, 105);
		
		doc.setFontSize(12);
		doc.text("Datos de emisor", 170, 45);
		doc.setFontSize(11);
		//doc.text("Rut empresa: 11111111-1", 170, 70);
		doc.text("Razón social: Yuyitos", 170, 70);
		doc.text("Dirección: San Bernardo 123", 170, 85);
		doc.text("Correo: almacenyuyitos@gmail.com", 170, 100);

		//INFO DEL CLIENTE Y DEL DOCUMENTO 123
		doc.setDrawColor(0, 0, 0);
		doc.roundedRect(40, 140, 520, 70, 5, 5);
		doc.setFontSize(12);
		doc.text("Nombre cliente",50, 155);
		doc.text(":",125, 155);
		doc.text(renderToString(data.nombreCliente), 130, 155);
		doc.text("RUN",50, 170);
		doc.text(":",125, 170);
		doc.text(renderToString(data.runCliente), 130, 170);
		doc.text("Correo",50, 185);
		doc.text(":",125, 185);
		doc.text(renderToString(data.emailCliente), 130, 185);
		doc.text("Teléfono",50, 200);
		doc.text(":",125, 200);
		doc.text(renderToString(data.telefonoCliente), 130, 200);
		//INFO DE PRODUCTOS COMPRADOS
		doc.roundedRect(40, 220, 520, 480, 5, 5);
		doc.autoTable({
		columns:[
				{ header: 'Código producto', dataKey: 'idProducto' },
				{ header: 'Descripción producto', dataKey: 'descripcionProducto' },
				{ header: 'Cantidad', dataKey: 'cantidad' },
				{ header: 'Total compra', dataKey: 'valorTotalFormat' },
			],

		body:rowsDetalles,
		  	margin:{top:225, horizontal: 45},
			theme: "plain",
		
		})
		if(data.tipoDocumento == 'Fiado'){
			doc.setDrawColor(0, 0, 0);
			doc.setLineWidth(2);
			doc.text("SIN TIMBRE SII", 130, 765);
		}else{
			doc.setDrawColor(0, 0, 0);
			doc.setLineWidth(2);
			let sii = new Image();
			sii.src = imagesList.TimbreElectronico;
			doc.addImage(sii, 20, 725, 300, 100);
		}
		
		//INFO SII
		doc.roundedRect(40, 710, 255, 120, 5, 5);
		//INFO TOTALES
		doc.roundedRect(305, 710, 255, 120, 5, 5);
		doc.text("MONTO NETO",315, 735);
		doc.text(":",400,735);
		doc.text(renderToString(data.totalNetoFormat), 410, 735);
		doc.text("VALOR IVA",315, 750);
		doc.text(":",400,750);
		doc.text(renderToString(data.totalIvaFormat), 410, 750);
		doc.text("TOTAL",315, 765);
		doc.text(":",400,765);
		doc.text(renderToString(data.totalVentaFormat), 410, 765);
		
		window.open(doc.output('bloburl'))	
	}

	const disabledForm = true


	

	const finalizarVenta = async (e) => {
		e.preventDefault()
	
		if(listadoPreventa.length == 0) {
			Swal.fire({
				position: 'center',
				icon: 'warning',
				title: '!ERROR',
				text: 'Debe ingresar productos o preventas',
				showConfirmButton: true,
				timer: 2500
			})
		} else {
			const { data } = await ApiRequest().post(`/venta`,  Object.assign(ventaData, {idPreventa: idPreventa}));	
			generarPdf(data.resultado.response)
			setFormularioVenta();
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: '!VENTA N°'+ ' '+ data.resultado.response,
				text: 'Generada exitosamente!',
				showConfirmButton: true,
				timer: 2500
			})
		}
		
	}


    const handleSubmit = async (e) => {
		e.preventDefault();
		setGuardando(true);
		setGuardandoHidden(false);
		if(idPreventa == undefined) {
			const { data } = await ApiRequest().post(`/preventa`, producto);
			if(data.errors == undefined) {
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				await ApiRequest().post(`/preventa-generar/${data.resultado.response}`);
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

	useEffect(() =>{
		obtenerTipoPago();
		obtenerTipoDocumento();
	}, [])

	useEffect(()=>{
		const {pagado, total, realizar, iva, neto, tarjeta, fiado} = pagadoCaja
		
		if(realizar > 0) {
			if(tarjeta == 1) {
				setVentaData({
					...ventaData,
					vuelto: 0,
					pagado: total,
					total: total,
					iva: iva,
					neto: neto,
				})
			} 
			else if(fiado == 1) {
				setVentaData({
					...ventaData,
					vuelto: 0,
					pagado: 0,
					total: total,
					iva: iva,
					neto: neto,
				})	
			}
			else if(tarjeta == 0 && fiado == 0)
			{
				if((pagado - total) > 0 ) {
					setVentaData({
						...ventaData,
						vuelto: (pagado - total),
						pagado: pagado,
						total: total,
						iva: iva,
						neto: neto,
					})		
				} 
				else {
					setVentaData({
						...ventaData,
						vuelto: ""
					})
				}
			}	
				
		} 
		
	}, [pagadoCaja])

	const isFiado = (e) => {
		if(e == 4) {
			setDisabledFidado(false);	
		} else {
			setDisabledFidado(true);
		}
	}

	const isEfectivo = (e) => {
		if(e == 1) {
			setDisabledPagadoEfectivo(false);	
			setDisabledPagadoTarjeta(true)
		} else {
			setDisabledPagadoEfectivo(true);
			setDisabledPagadoTarjeta(false);
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
			
			{/* MODAL AGREGAR PRODUCTO */}
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
									maxLength={2}
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
			
			

			{/* MODAL PRODUCTOS */}
			<Dialog maxWidth='lg' fullWidth open={buscarProductosModal}>
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

			{/* MODAL PREVENTAS */}
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
					Búsqueda de preventas pendientes
				</DialogTitle>
				<hr />
				<DialogContent>
				<Grid container spacing={2}>
				<Grid item xs={12} sm={12}>
					{/**BOTON PARA ABRIR MODAL */}
					<Row >
						<Col  xl={3}>
							<Form.Control type="text" placeholder='Buscar' onChange={e => {initBuscarPreventa(e.target.value)}}/>
						</Col>
					</Row>
				</Grid>
				<Grid item xs={12} sm={12}>
					<CommonTable data={listadoPreventasGeneradas} columns={columnsPreventa} autoHeight={true}/>
				</Grid>
				</Grid>
				</DialogContent>
				<DialogActions>
					<Button variant='secondary' color='primary' onClick={handleCloseListadoPreventas}>Cerrar</Button>
				</DialogActions>
			</Dialog>
			
			{/* MODAL CLIENTES */}
			<Dialog maxWidth='lg' fullWidth open={showClientes}>
				<DialogTitle>
					<IconButton aria-label="close"
						onClick={handleCloseModalClientes}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close></Close>
					</IconButton>
					Listado de setShowClientes
				</DialogTitle>
				<hr />
				<DialogContent>
				<Grid container spacing={2}>
				<Grid item xs={12} sm={12}>
					{/**BOTON PARA ABRIR MODAL */}
					<Row >
						<Col  xl={3}>
							<Form.Control type="text" placeholder='Buscar' onChange={e => {initIdCliente(e.target.value)}}/>
						</Col>
					</Row>
				</Grid>
				<Grid item xs={12} sm={12}>
				<CommonTable data={listadoClientes} columns={columnsCliente} autoHeight={false}/>
				</Grid>
				</Grid>
				</DialogContent>
				<DialogActions>
					<Button variant='secondary' color='primary' onClick={handleCloseModalClientes}>Cerrar</Button>
				</DialogActions>
			</Dialog>

			
			

            <Page title="YUYITOS | caja">
				<Container maxWidth='xl'>
				<Box sx={{ pb: 5 }}>
					<Typography variant="h5">Caja de ventas</Typography>
				</Box>	
				
					<Grid container spacing={2}>
						<Grid item>
							<Button variant="primary" onClick={handleShow}>
								Agregar producto
							</Button>
						</Grid>
						<Grid item>
							<Button variant="info" onClick={handeShowListadoPreventas}>
								Agregar preventa
							</Button>
						</Grid>
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoPreventa} columns={columns} autoHeight={false}/>
						</Grid>
						<hr />
						<Grid item xs={6} sm={6}>
						<Grid item>
						<Row className="mb-3">
								<Form.Group as={Col} md="7" controlId="formRut">
								<Form.Label>Rut cliente</Form.Label>
									<InputGroup hasValidation>
									<Form.Control type="text" 
										placeholder="Ingrese un rut"
										disabled
										value={ventaData.rutCliente}
										/>
									</InputGroup>
								</Form.Group>
								<Form.Group as={Col} md="5" controlId="formRut">
								<Form.Label></Form.Label>
								<InputGroup hasValidation>
								<DialogActions>
									<Button variant="success" 
											position='center' 
											onClick={handleShowModalClientes}
										>
										Buscar cliente
									</Button>
								</DialogActions>
								</InputGroup>
								</Form.Group>
							</Row>	
						</Grid>
						</Grid>
						<Grid item xs={6} sm={6}>
							<Grid item>
							<Row className="mb-3">
								<Form.Group as={Col} md="6" controlId="formRut">
								<Form.Label>Tipo de pago</Form.Label>
								<InputGroup hasValidation>
								<Form.Select aria-label="Comuna"
													disabled={disabledTipoPago}
													onChange={(e)=> {
														setVentaData({...ventaData, idTipoPago: e.target.value})
														isEfectivo(e.target.value)
														if(e.target.value == 2) {
															setPagadoCaja({...pagadoCaja, tarjeta: 1, realizar: 1, fiado: 0})
														} else {
															setPagadoCaja({...pagadoCaja, tarjeta: 0, realizar: 1, fiado: 0})	
														}
													}}
													>
									<option hidden value={0}>Seleccione un tipo de pago</option>
										{
											listadoTipoPago.map((item, index) => (
											<option value={item.id} key={index}>{item.nombreTipoPago}</option>
											))
										}
									</Form.Select>
								</InputGroup>
								</Form.Group>
								<Form.Group as={Col} md="6" controlId="formRut">
								<Form.Label>Tipo de documento</Form.Label>
								<InputGroup hasValidation>
								<Form.Select aria-label="Comuna"
											onChange={(e)=> {
												setVentaData({...ventaData, idTipoDocumento: e.target.value})
												isFiado(e.target.value)
												
												if(e.target.value == 4) {
													isEfectivo(2)
													setDisabledTipoPago(true)
													setListadoTipoPago([])
													setPagadoCaja({...pagadoCaja, fiado: 1, realizar: 1, tarjeta: 0})
												} else {
													setDisabledTipoPago(false)
													obtenerTipoPago()
												}
											}}
											>
									<option hidden value={0}>Seleccione un tipo de documento</option>
										{
											listadoDocumentos.map((item, index) => (
											<option value={item.id} key={index}>{item.nombreDocumento}</option>
											))
										}
									</Form.Select>
								</InputGroup>
								</Form.Group>
							</Row>
							</Grid>
						</Grid>
						<Grid item xs={6} sm={6}>
						<Grid item>
							<Form noValidate hidden={false}>
								<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formRut">
									<Form.Label>Nombre cliente</Form.Label>
									<InputGroup hasValidation>
									<Form.Control type="text" 
										value={ventaData.nombreCliente}
										placeholder="Ingrese un rut"
										disabled
										/>
									</InputGroup>
									</Form.Group>
									<Form.Group as={Col} md="6" controlId="formRut">
									<Form.Label>Fecha de pago</Form.Label>
									<InputGroup hasValidation>
									<Form.Control type="date" 
										disabled={disabledFiado}
										placeholder="Ingrese un rut"
										onChange={(e)=> {
											setVentaData({...ventaData, fechaPago: e.target.value})
										}}
										/>
									</InputGroup>
									</Form.Group>
								</Row>	
							</Form>
						</Grid>
						</Grid>
						<Grid item xs={6} sm={6}>
						<Grid item>
							<Form noValidate hidden={false}>
								<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formRut">
									<Form.Label>Pagado</Form.Label>
									<InputGroup hasValidation>
									<Form.Control type="number" 
										placeholder="Ingrese el total pagado"
										hidden={disabledPagadoTarjeta} 
										disabled
										value={ventaData.pagado}
										/>
									<Form.Control type="number" 
										placeholder="Ingrese el total pagado"
										disabled={disabledPagado}
										hidden={disabledPagadoEfectivo}
										onChange={(e)=> {
											setPagadoCaja({...pagadoCaja, pagado: e.target.value, realizar: 1})
										}}
										/>
									</InputGroup>
									</Form.Group>
									<Form.Group as={Col} md="6" controlId="formRut">
									<Form.Label>Vuelto</Form.Label>
									<InputGroup hasValidation>
									<Form.Control type="number" 
										value={ventaData.vuelto}
										placeholder="vuelto"
										disabled
										/>
									</InputGroup>
									</Form.Group>
								</Row>	
							</Form>
						</Grid>
						</Grid>
						<Grid item xs={12} sm={12}>
							
                            <Form.Label><h5>Total</h5></Form.Label>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
										<th>Total</th>
										<th>Neto</th>
										<th>Iva</th>
										<th>Vendedor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    <tr>
										<td>{totalesPreventa.total}</td>
										<td>{totalesPreventa.neto}</td>  
										<td>{totalesPreventa.iva}</td>
										<td>{totalesPreventa.usuario}</td>  
									</tr>
                                }
                                </tbody>
                            </Table>
						</Grid>
						<Grid item xs={6} sm={6}></Grid>
						<Grid item xs={6} sm={6}>
							<Row className="xs-6">
									<Form.Group as={Col} md="5" controlId="formRut"></Form.Group>
									<Form.Group as={Col} md="4" controlId="formRut">
										<Button variant="danger"
											onClick={limpiarVentaCaja}
											>
											Limpiar venta
										</Button>
									</Form.Group>
									<Form.Group as={Col} md="3" controlId="formRut">
										{/* <Button variant="primary" 
											type='submit'
											hidden={generando}
											disabled={disabledGenerando}
											onClick={generarPreventa}
											>
											Generar preventa
										</Button>  */}
										<Button variant="primary" onClick={finalizarVenta}>
											Generar venta
										</Button>
									</Form.Group>
								</Row>	
							
							{/* <Grid item>
								<Button variant="primary">
									Agregar producto
								</Button>
							</Grid>

								<Button variant="info">
									Agregar preventa
								</Button> */}
						</Grid>

                    </Grid>
				</Container>
			</Page> 
        </>
    )
}

export default Caja;