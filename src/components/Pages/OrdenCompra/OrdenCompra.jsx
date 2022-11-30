import React, { useState, useEffect, useRef } from 'react'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { EditOutlined, DeleteOutline, Close, TryRounded, LabelImportantOutlined, 
	Add, PanoramaFishEye, Inventory, PictureAsPdf, InfoOutlined, Search } from '@mui/icons-material'
import Page from '../../common/Page'
import CommonTable from '../../common/CommonTable'
import Swal from 'sweetalert2';
import { Modal, Button, Row, Form, InputGroup, Col, ButtonGroup, Table, ListGroup, Spinner } from 'react-bootstrap';
import { renderToString } from "react-dom/server";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { table } from '../../../helpers/table'
import { PDFObject } from "react-pdfobject";
import imagesList from '../../../assets/';

const OrdenCompra = (props) => {

	const descargarPdf = async (id) => {

		const marginData = 235;
		const pageDimensions = {
			height: 841,
			width: 595,
		};
		const pageMargin = 50;
		const padding = 15;
		const liveArea = {
			width: pageDimensions.width - pageMargin - 5,
			height: pageDimensions.height - pageMargin - 100,
		};

		const rowsDetalles = [];
		const datos = await ApiRequest().get(`/detalle-orden-general/${id}`);
		datos.data.map(item=> (rowsDetalles.push(item)))
		
		const rowsTotales = [];
		const datosTotal = await ApiRequest().get(`/orden-compra/${id}`);
		datosTotal.data.map(item=> (rowsTotales.push(item)))

		const doc = new jsPDF('p','pt','a4');

		let img = new Image();
		img.src = imagesList.yuyitosLogo
		doc.addImage(img, 40, 35, 140, 75);
		doc.setFontSize(14);
		doc.text("N° Orden: ", 350, 60);
		doc.text(renderToString(rowsTotales[0].id), 425, 60);
		doc.text("Fecha: ", 350, 80);
		doc.text(renderToString(rowsTotales[0].fechaOrdenCompra), 425, 80);
		doc.text("Estado: ", 350, 100);
		doc.text(renderToString(rowsTotales[0].nombreEstado), 425, 100);

		doc.text(40, 25, "Orden de compra");
		doc.setFont("arial", "title");
		doc.setFontSize(14);
		doc.setDrawColor(255, 0, 0);
		doc.line(30, 30, 560, 30);
		doc.setLineWidth(1);
		doc.rect(40, 120, 250, 20);
		doc.setLineWidth(1);
		doc.rect(290, 120, 260, 20);
		doc.text(40, 135, " Datos proveedor");
		doc.text(290, 135, " Datos emisor");
		doc.setFont("arial");
		doc.setFontSize(11);
		doc.setLineWidth(1);
		doc.rect(40, 140, 250, 90);
		doc.setLineWidth(1);
		doc.rect(290, 140, 260, 90);
		//doc.text("Orden de compra n°: ", 40, 80);
		doc.text("Rut: ", 45, 160);
		doc.text(renderToString(rowsTotales[0].rutProveedor), 95, 160);
		doc.text("Nombre: ", 45, 180);
		doc.text(renderToString(rowsTotales[0].nombreProveedor), 95, 180);
		doc.text("Dirección: ", 45, 200);
		doc.text(renderToString(rowsTotales[0].direccionProveedor), 95, 200);
		doc.text("Correo: ", 45, 220);
		doc.text(renderToString(rowsTotales[0].correoProveedor), 95, 220);
		//  
		doc.text("Rut: ", 295, 160);
		doc.text("18962869-k", 350, 160);
		doc.text("Nombre: ", 295, 180);
		doc.text("Sra Juanita", 350, 180);
		doc.text("Dirección: ", 295, 200);
		doc.text("Duoc UC", 350, 200);
		doc.text("Correo: ", 295, 220);
		doc.text("almacenyuyitos2022@gmail.com", 350, 220);

		doc.setLineWidth(1);
		doc.rect(40, 280, 515, 550);

		const pdfColumnsPain = [
            {
                name: 'CÓDIGO',
                raw: "idProducto",
                pdf: true,
                pdfWidth: 70,
                pdfAlign: "center",
            },
			{
                name: 'DESCRIPCIÓN',
                raw: "nombreProducto",
                pdf: true,
                pdfWidth: 230,
                pdfAlign: "center",
            },
			{
                name: 'CANTIDAD',
                raw: "cantidad",
                pdf: true,
                pdfWidth: 70,
                pdfAlign: "center",
            },
			{
                name: 'TOTAL',
                raw: "totalCompraFomat",
                pdf: true,
                pdfWidth: 70,
                pdfAlign: "center",
            },
        ];
        table(doc, pdfColumnsPain, datos.data.map((item,index)=>{return {...item}}),
			pageMargin,
			liveArea,
			padding,
            250 //-30 para volver a poner el subtitulo
        );
	
		window.open(doc.output('bloburl'), '_blank');
	}
	const [msgErrors, setMsgErrors] = useState({
		descripcionError: "",
		observacionesError: "",
		cantidadError: "",
		productoError: ""
	})

	const [isError, setIsError] = useState({
		descripcion: false,
		observaciones: false,
		cantidad: false,
		producto: false
	});

	const [rutMsgError, setRutMsgError] = useState({
		rutProveedorError: ""
	})

	const [rutIsError, setRutIsError] = useState({
		rut: false
	})

	const [detalleOrden, setDetalleOrden] = useState({
		id: "",
		observaciones: "",
		rutProveedor: "",
		cantidad: "",
		producto: "",
		total: "",
		iva: "",
		precio: ""
	})

	const [detalleProducto, setDetalleProducto] = useState({
		porcentajeIva: "",
		precioCompraProducto: ""
	})

	const [idOrden, setIdOrden] = useState(null);
	const [detalleOrdenCompra, setDetalleOrdenCompra] = useState([]);
	const [readOnly, setReadOnly] = useState(true);
	const [suma, setSuma] = useState({cantidad: 0, precio: 0})
	const [showOrden, setShowOrden] = useState(false);
	const [showFinish, setShowFinish] = useState(false);
	const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false), setIsError(false)};
    const handleShow = () => {setShow(true), setIsClose(false), setBotones(), setIsUpdate(false), confirmandoHiddenFuncion()};
	const handleFinishSend = () => {setShowFinish(true)};
	const [showConfirm, setShowConfirm] = useState(false);
	const [isClose, setIsClose] = useState(false);
	const handleCloseDelete = () => {setShow(false)};
    const handleShowDelete = () => {setShowDeleteConfirm(true), setIsClose(true)};
	const handleCloseError = () => {setShowErrorForm(false)};
	const [buscarProveedorModal, setBuscarProveedorModal] = useState(false);
	const handleShowBuscarProveedor = () => { setBuscarProveedorModal(true), initProveedor() };
	const handleCloseBuscarProveedor = () => setBuscarProveedorModal(false);
	
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showErrorForm, setShowErrorForm] = useState(false);
	const [idEdit, setIdEdit] = useState(null);
	const [rutEdit, setRutEdit] = useState(false)
	const [isEdit, setIsEdit] = useState(false);
	const [isDetail, setIsDetail] = useState(false);
	const [isUpdate, setIsUpdate] = useState(false);
	const [readOnlyProducto, setReadOnlyProducto] = useState(true);
    const [listadoOrdenCompra, setListadoOrdenCompra] = useState([]);
	const [ordenCompraTotal, setOrdenCompraTotal] = useState([])
	const [listadoProductos, setListadoProductos] = useState([])
	const [datosProveedor, setDatosProveedor] = useState({
		rutProveedor: "",
		correoProveedor: "",
		descripcionRubro: "",
		direccionProveedor: "",
		nombreProveedor: "",
		telefonoProveedor: ""
	});
	const [isBtnBuscar, setIsBtnBucar] = useState(false);
	const [listadoProveedores, setListadoProveedores] = useState([]);
	const [agregando, setAgregando] = useState(false);
	const [agregarHidden, setAgregarHidden] = useState(true);
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);
	const [confirmandoHidden, setConfirmandoHidden] = useState(true);
	const [confirmando, setConfirmando] = useState(false);
	const [isEmitir, setIsEmitir] = useState(false);
	const [isAnular, setIsAnular] = useState(false);
	const [isProcesar, setIsProcesar] = useState(true);

	const initProveedor = async () => {
		const { data } = await ApiRequest().get('/listar-proveedor');
		setListadoProveedores(data);
	}

	const initIdProveedor = async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/proveedor/${buscar}`)
			setListadoProveedores(data);	
		} else {
			initProveedor()
		}
	}

	//realizar calculo de total
	useEffect(()=>{
		const {cantidad, precio} = suma
		setDetalleProducto({
			...detalleProducto,
			precioCompraProducto: (cantidad * precio)
		})
	}, [suma])

    const init = async () => {
		const { data } = await ApiRequest().get(`/orden-compra`);
		setListadoOrdenCompra(data);
	}
	
	const obtenerOrdenCompra = async (id) => {
		const { data } = await ApiRequest().get(`/orden-compra/${id}`);
		setOrdenCompraTotal(data);
		setDatosProveedor({
			...datosProveedor,
			rutProveedor: data[0].rutProveedor,
			correoProveedor: data[0].correoProveedor,
			descripcionRubro: data[0].nombreRubro,
			direccionProveedor: data[0].direccionProveedor,
			nombreProveedor: data[0].nombreProveedor,
			telefonoProveedor: data[0].telefonoProveedor
			
		})

		let select = []

		data.map((item, index)=> {
			select.push((<h5 key={index}>{item.correoProveedor}</h5>))
			//select.push((<h5 key={index}>{item.direccionProveedor}</h5>))
		});
	}

	const buscarProductosProveedor = async (id) => {
		const { data } = await ApiRequest().get(`/proveedor-productos/${id}`);
		setListadoProductos(data);	
	}

	const buscarProveedor = async (rut) => {

			const { data } = await ApiRequest().get(`/proveedor-buscar/${rut}`);
			if(data.message == undefined) {
				buscarProductosProveedor(data.id);
				setDatosProveedor(data);
				setDetalleOrden({
					...detalleOrden,
					id: data.id
				})
				setReadOnly(false);	
				setIsDetail(true);
			} else {
				setRutMsgError({...rutMsgError,
					rutProveedorError: data.message});
		
				setRutIsError({...rutIsError,
				rut: true});	
			}
			handleCloseBuscarProveedor();
			
	}

	const initId = async (buscar) => {
		if(buscar.length) {
			const { data } = await ApiRequest().get(`/orden-compra-filtro/${buscar}`)
			setListadoOrdenCompra(data);	
		} else {
			init();
		}	
	}

	const setColor = (estado) => {
		if(estado == 'Pendiente') {
			return "green";
		} else if(estado == 'Emitida'){
			return "blue";	
		} else if (estado == 'Anulada') {
			return "red";
		} else if (estado == 'Ingresada') {
			return "green";
		} else if (estado == 'Rechazado') {
			return "red";
		}		
	}
 
    const columns = [
		{ field: 'id', headerName: 'N°', width: 100 },
        { field: 'fechaOrdenCompra', headerName: 'Fecha creación', width: 150 },
		{ field: 'rutProveedor', headerName: 'Rut proveedor', width: 150 },
		{ field: 'nombreProveedor', headerName: 'Nombre proveedor', width: 150 },
		{ field: 'correoProveedor', headerName: 'Correo proveedor', width: 200 },
		{ field: 'totalOrdenCompraFomat', headerName: 'Total', width: 150 },
		{ field: 'ivaOrdenCompraFomat', headerName: 'Iva', width: 150 },
		{ field: 'nombreEstado', headerName: 'Estado', width: 150, renderCell: (params)=> (
		<Typography style={{fontSize: "8"}}>{params.getValue(params.id, 'nombreEstado')}
		<LabelImportantOutlined  style={{color: setColor(params.getValue(params.id, 'nombreEstado'))}}/></Typography>
		)	
		},
		{
			field: '',
			headerName: 'Acciones',
			width: 300,
			renderCell: (params) => (
				<Stack direction='row' justifyContent="center" alignItems="center" spacing={4}>
					<Button size='sm' disabled={disabledEdit(params.row.estadoOrdenId)} onClick={() => {
						setIsEdit(true);
						handleEdit(params.row);
					}}>
						<EditOutlined />
					</Button>
					<Button variant='info' size='sm' onClick={() => {
						setShowOrden(true);
						obtenerDetalleOrdenCompra(params.id);
						obtenerOrdenCompra(params.id);
						setIdOrden(params.id);
						hiddenEmitir(params.row.estadoOrdenId);
						hiddenAnular(params.row.estadoOrdenId);
					}}>
						<InfoOutlined  />
					</Button>
					<Button size='sm' onClick={() => {
						descargarPdf(params.id);
						//eliminarUnidadMedida(params.row.id);
					}}>
						<PictureAsPdf  />
					</Button>
					<Button variant='danger' size='sm' disabled={disabledDelete(params.row.estadoOrdenId)} onClick={() => {
						eliminarOrdenCompra(params.row.id);
					}}>
						<DeleteOutline  />
					</Button>
				</Stack>
			)
		}
	]

	const disabledDelete = (value) => {
		if(value == 1) {
			return false;
		} return true;
	}

	const disabledEdit = (value) => {
		if(value == 1 || value == 3 || value == 5) {
			return true;
		} return false;
	}

	const hiddenEmitir = (value) => {
		if(value == 3 || value == 1 || value == 5) {
			setIsProcesar(true);
			setIsEmitir(true);
			if(value == 1) {
				setIsAnular(true);	
			} else if(value == 5) {
				setIsProcesar(false);	
			} 
		} else {
			setIsEmitir(false);
			setIsProcesar(true);
		}
	}

	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/orden-compra/${id}`)
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: data.message,
				showConfirmButton: true,
				timer: 2500
			}).then(() => {
				init();
			})	
	}

	const eliminarOrdenCompra = async (id) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar esta orden de compra?!",
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

	const hiddenAnular = (value) => {
		if(value == 3 || value == 1 || value == 5) {
			if(value == 1) {
				setIsProcesar(false);
			}
			setIsAnular(true);
		} else {
			setIsAnular(false);	
			setIsProcesar(true);
		}
	}

    const columnsDetail = [
		{ field: 'id', headerName: 'Id', width: 100 },
        { field: 'nombreProducto', headerName: 'descripcion', width: 300 },
		{ field: 'cantidad', headerName: 'cantidad', width: 100 },
		{ field: 'totalCompraFomat', headerName: 'total compra', width: 200 },
		{
			field: '',
			headerName: 'Acciones',
			width: 150,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={4}>
					<IconButton size='small' onClick={() => {
						eliminarDetalleOrdenCompra(params.row.id)
					}}>
						<DeleteOutline  />
					</IconButton>
				</Stack>
			)
		}
	]

	const columnsProveedor = [
		{ field: 'rutProveedor', headerName: 'Rut', width: 200 },
		{ field: 'nombreProveedor', headerName: 'Nombre', width: 200 },
		//estas son las acciones del data table
		{
			field: '',
			headerName: 'Acciones',
			width: 150,
			//params son los parametros del data table
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={2}>
					{/**ESTE ES EL BOTON EDITAR */}
					<Button size='sm' onClick={() => {
						buscarProveedor(params.row.rutProveedor);
					}}>
						<Add />
					</Button >
				</Stack>
			)
		}
	]

    const handleEdit = async (values) => {
		setIsBtnBucar(true);
		buscarProductosProveedor(values.proveedorId)
		setIdOrden(values.id)
		setIdEdit(values.id)
		setIsEdit(true);
		setReadOnly(false);
		setDatosProveedor({
			...datosProveedor,
			rutProveedor: values.rutProveedor,
			correoProveedor: values.correoProveedor,
			descripcionRubro: values.nombreRubro,
			direccionProveedor: values.direccionProveedor,
			nombreProveedor: values.nombreProveedor,
			telefonoProveedor: values.telefonoProveedor
		})	
		const { data } = await ApiRequest().get(`/detalle-orden-compra/${values.id}`)
		setDetalleOrdenCompra(data)
		handleShow()

	}

	const eliminarDetalleOrdenCompra = async (id) => {
		const { data } = await ApiRequest().delete(`/detalle-orden-compra-unidad/${id}`)
		await obtenerDetalleOrdenCompra(idOrden)	
	}

	const changeModal = () => {
		resetForm()
		setDetalleOrdenCompra([])
		setIsEdit(false);	
		handleShow();	
		setIsBtnBucar(false)
		setIsUpdate(false);
	}

	function setAgregandoEstado() {
		setAgregando(false);
		setAgregarHidden(true);
	}

	const agregarProducto = async () => {
		setIsUpdate(true);
		setAgregando(true);
		setAgregarHidden(false);
		if(detalleOrdenCompra.length == 0 && isEdit == false) {
			const { data } = await ApiRequest().post(`/orden-compra`, Object.assign(detalleOrden, {iva: detalleProducto.porcentajeIva}, 
				{total: detalleProducto.precioCompraProducto}, {precio: suma.precio}, {cantidad: suma.cantidad}));
			if(data.errors == undefined) {
				obtenerDetalleOrdenCompra(data.resultado.response)
				setIdOrden(data.resultado.response)	
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
			setAgregandoEstado();
		} else {
			const { data } = await ApiRequest().post(`/detalle-orden-compra/${idOrden}`, Object.assign(detalleOrden, {iva: detalleProducto.porcentajeIva}, 
					{total: detalleProducto.precioCompraProducto}, {precio: suma.precio}, {cantidad: suma.cantidad}));	
			if(data.errors == undefined) {
				obtenerDetalleOrdenCompra(idOrden)		
			}
			setAgregandoEstado();	
		}
		
	}

	function setBotones () {
		setGuardando(false);
		setGuardandoHidden(true);
	}
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		setGuardando(true);
		setGuardandoHidden(false);

		if(detalleOrdenCompra.length == 0) {
			setShowErrorForm(true);
			setBotones();
		} else {
			const { data } = await ApiRequest().put(`/orden-compra/generar/${idOrden}`);
			handleClose();
			resetForm();
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: data.message,
				showConfirmButton: true,
				timer: 2500
			})
			init();	
		}
	}

	const resetForm = () => {
		setReadOnlyProducto(true);
		setReadOnly(true);
		setShowConfirm(false);
		setRutEdit(true);
		setIsDetail(false);
		setSuma({
			...suma,
			precio: "",
			cantidad: ""
		})	
		setDatosProveedor({
			...datosProveedor,
			rutProveedor: "",
			correoProveedor: "",
			descripcionRubro: "",
			direccionProveedor: "",
			nombreProveedor: "",
			telefonoProveedor: ""
		})	
		setDetalleOrden({
			...detalleOrden,
			id: "",
			observaciones: "",
			rutProveedor: "",
			cantidad: "",
			producto: "",
			total: "",
			iva: "",
			precio: ""
		})

		setMsgErrors({
			...msgErrors,
			descripcionError: "",
			observacionesError: "",
			cantidadError: "",
			productoError: ""
		})

		setIsError({
			...isError,
			descripcion: false,
			observaciones: false,
			cantidad: false,
			producto: false
		})

		setRutMsgError({
			...rutMsgError,
			rutProveedorError: ""
		})

		setRutIsError({
			...rutIsError,
			rut: false
		})
	}

	function confirmandoHiddenFuncion() {
		setConfirmando(false);
		setConfirmandoHidden(true);
	}

	const modalConfirmacionAceptar = async () => {
		handleCloseDelete(true);
		setConfirmando(true);
		setConfirmandoHidden(false);
	
		if(isEdit == false) {
			if(detalleOrdenCompra.length > 0) {
				const { data } = await ApiRequest().delete(`/orden-compra/${idOrden}`);
				setIdOrden(null);
				obtenerDetalleOrdenCompra(idOrden);	
				resetForm();
				setDetalleOrdenCompra([]);
				setListadoProductos([]);
			}
			setShowDeleteConfirm(false);
			confirmandoHiddenFuncion();
		} else {
			if(isUpdate) {
				const { data } = await ApiRequest().delete(`/detalle-orden-compra/cancelar/${idOrden}`);
				setDetalleOrdenCompra([]);
				setListadoProductos([]);
				setShowDeleteConfirm(false);
				confirmandoHiddenFuncion();
				Swal.fire({
					position: 'center',
					icon: 'info',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})	
			} else {
				setShowDeleteConfirm(false);
				confirmandoHiddenFuncion();
				Swal.fire({
					position: 'center',
					icon: 'info',
					title: 'No se realizaron cambios',
					showConfirmButton: true,
					timer: 2500
				})	
			}
			init();
		}	
	}

	const modalConfirmacionCancelar = () => {
		setShowDeleteConfirm(false);
		setShowConfirm(false)
		setRutEdit(false)	
	}

	const obtenerPrecioCompra = async (id) => {
		const { data } = await ApiRequest().get(`/orden-compra/productos/${id}`);
		setDetalleProducto(data)
		setSuma({
			...suma,
			precio: data.precioCompraProducto,
			cantidad: 1
		})	
	} 

	const obtenerDetalleOrdenCompra = async(id) =>{
		const { data } = await ApiRequest().get(`/detalle-orden-general/${id}`);	
		setDetalleOrdenCompra(data);
	}

	const [isSend, setIsSend] = useState({
		estadoOrden: ""
	});
	const [colorButton, setColorButton] = useState();

	const finalizarPedido = async() => {
		setShowFinish(false);	
		setShowOrden(false);
		
		const { data } = await ApiRequest().put(`/orden-compra/estado/${idOrden}`, Object.assign(isSend, {oobservaciones: ''}));
		Swal.fire({
			position: 'center',
			icon: 'info',
			title: data.message,
			showConfirmButton: true,
			timer: 2500
		}).then(() => {
			init();
		})
	}

	const buscarOtroProveedor = () => {
		if(detalleOrdenCompra.length == 0) {
			handleShowBuscarProveedor();
		} else {
			setShowConfirm(true);
		}
		
	}

	const setNumbersNegative = (value) => {
		if(value < 0) {
			return 1
		}
	}

	//
	useEffect(()=>{

		if(props.step == 'ordenCompra') {
			init()	
		}	
	}, [])
    //useEffect(init, [])

    return(
        <>	
			<Dialog maxWidth='xs' open={showConfirm}>

				<DialogTitle>
					¿Desea buscar otro proveedor?
				</DialogTitle>
				<DialogContent>
					<Typography variant='h5'>Recuerda que al aceptar eliminará los cambios actuales</Typography>
				</DialogContent>
				<DialogActions>
					<Button variant='secondary' color='primary' onClick={modalConfirmacionCancelar}>cancelar</Button>
					<Button variant='danger' color='primary' onClick={modalConfirmacionAceptar}>aceptar</Button>
				</DialogActions>
			</Dialog>

			<Dialog maxWidth='xs' open={showDeleteConfirm}>
				<DialogTitle>
					{isEdit ? '¿Desea cerrar la edición?' : '¿Desea cancelar la orden de compra?'}
				</DialogTitle>
				<DialogContent>	
					<Typography variant='h5'>
						Recuerda que al aceptar eliminará los cambios actuales
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button variant="secondary" color='primary' onClick={modalConfirmacionCancelar} hidden={confirmando}>cancelar</Button>
					<Button variant='danger' color='primary' onClick={modalConfirmacionAceptar} hidden={confirmando}>aceptar</Button>
					<Button variant="danger" hidden={confirmandoHidden} disabled={confirmando}>
						<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> ..Cancelando
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog maxWidth='xs' open={showErrorForm}>
				<DialogTitle>
					!ERROR! Debe completar el formulario
				</DialogTitle>
				<hr />
				<DialogActions>
					<Button variant="primary" color='primary' onClick={handleCloseError}>aceptar</Button>
				</DialogActions>
			</Dialog>

			<Dialog maxWidth='xs' open={showFinish}>
				<DialogTitle>
					{isSend ? '¿Desea emitir la orden de compra?' : '¿Desea anular la orden de compra?'}
				</DialogTitle>
				<DialogContent>	
					<Typography variant='h5'>
						Recuerda que esta acción es irreversible
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button variant={"secondary"} color='primary' onClick={e => {setShowFinish(false)}}>cancelar</Button>
					<Button variant={colorButton} color='primary' onClick={finalizarPedido}>aceptar</Button>
				</DialogActions>
			</Dialog>

			<Dialog maxWidth='md' fullWidth open={showOrden}>
				<DialogTitle>
					<IconButton aria-label="close"
						onClick={e=> {setShowOrden(false)}}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close>
						</Close>
					</IconButton>
						{'Detalle de orden de compra'}
				</DialogTitle>
				<hr />
				<DialogContent>
					
					<Form.Label><h5>Datos de proveedor</h5></Form.Label>
						<Row className="mb-3">
						<Form.Group as={Col} md="6" controlId="formRut">
							<ListGroup variant="flush">
								<ListGroup.Item>Rut: {datosProveedor.rutProveedor}</ListGroup.Item>
								<ListGroup.Item>Nombre: {datosProveedor.nombreProveedor}</ListGroup.Item>
								<ListGroup.Item>Dirección: {datosProveedor.direccionProveedor}</ListGroup.Item>
							</ListGroup>
						</Form.Group>
						<Form.Group as={Col} md="6" controlId="formRut">
							<ListGroup variant="flush">
								<ListGroup.Item>Rubro: {datosProveedor.descripcionRubro}</ListGroup.Item>
								<ListGroup.Item>Correo: {datosProveedor.correoProveedor}</ListGroup.Item>
								<ListGroup.Item>Teléfono: {datosProveedor.telefonoProveedor}</ListGroup.Item>
							</ListGroup>
						</Form.Group>	

					</Row>
					<Form.Label><h5>Detalles de productos</h5></Form.Label>
					<Table striped bordered hover>
					<thead>
						<tr>
						<th>Nombre producto</th>
						<th>Cantidad</th>
						<th>Total compra</th>
						</tr>
					</thead>
					<tbody>
					{
						detalleOrdenCompra.map((orden, index) => (
							<tr key={index}>
								<td>{orden.nombreProducto}</td>
								<td>{orden.cantidad}</td>
								<td>{orden.totalCompraFomat}</td>  
							</tr>
						))
					}
					
					</tbody>
					</Table>
					<hr />
					<Form.Label><h5>Total compra</h5></Form.Label>
					<Table striped bordered hover>
					<thead>
						<tr>
						<th>Número de orden</th>
						<th>Total iva</th>
						<th>Total compra</th>
						</tr>
					</thead>
					<tbody>
					{
						ordenCompraTotal.map((total, index) => (
							<tr key={index}>
								<td>{total.id}</td>
								<td>{total.ivaOrdenCompraFomat}</td>
								<td>{total.totalOrdenCompraFomat}</td>  
							</tr>
						))
					}
					
					</tbody>
					</Table>
					<DialogActions>
							<Button variant="secondary" onClick={e=> {setShowOrden(false)}}>
								Cerrar
							</Button>
							<Button variant="danger" type='submit' hidden={isAnular} onClick={e => {handleFinishSend(), setIsSend({...isSend, estadoOrden: 1}), setColorButton('danger')}}>
								Anular
							</Button>
							<Button variant="success" type='submit' hidden={isProcesar} onClick={ e => {handleFinishSend(), setIsSend({...isSend, estadoOrden: 4}), setColorButton('success')}}>
								Procesar
							</Button>
							<Button variant="primary" type='submit' hidden={isEmitir} onClick={ e => {handleFinishSend(), setIsSend({...isSend, estadoOrden: 5}), setColorButton('success')}}>
								Emitir
							</Button>
						</DialogActions>	
				</DialogContent>	
			</Dialog>

			<Dialog maxWidth='sm' fullWidth open={buscarProveedorModal}>
				<DialogTitle>
					Búsqueda de proveedor
				</DialogTitle>
				<hr />
				<DialogContent>
				<Grid container spacing={2}>
				<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initIdProveedor(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>
					<Grid item xs={12} sm={12}>
					<CommonTable data={listadoProveedores} columns={columnsProveedor} autoHeight={true}/>
					</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button variant='secondary' color='primary' onClick={handleCloseBuscarProveedor}>Cerrar</Button>
				</DialogActions>
			</Dialog>

			<Dialog maxWidth='md' fullWidth open={show}>
				<DialogTitle>
					<IconButton aria-label="close"
						onClick={handleShowDelete}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close>
						</Close>
					</IconButton>
						{isEdit ? 'Editar orden de compra' : 'Agregar orden de compra'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate onSubmit={handleSubmit}>
						<Row className="mb-3">
							<Form.Group as={Col} md="6" controlId="formRut">
								<Form.Label>Rut proveedor</Form.Label>
								<InputGroup hasValidation>
									<Form.Control type="text" 
										placeholder="Ingrese un rut de proveedor"
										value={datosProveedor.rutProveedor}
										readOnly
										disabled
										onClick={handleShowBuscarProveedor}
										isInvalid={rutIsError.rut}/>
									<Form.Control.Feedback type="invalid">
										{rutMsgError.rutProveedorError}
									</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>
							<Form.Group as={Col} md="2" controlId="formRut">
							<Form.Label></Form.Label>
							<InputGroup hasValidation>
								<DialogActions>
								<Button variant="primary" position='center' 
								onClick={buscarOtroProveedor}
								disabled={isBtnBuscar}>
								<Search />
									Buscar
								</Button>
								</DialogActions>
								</InputGroup>
							</Form.Group>
							<Form.Group as={Col} md="4" controlId="formRubro">
								<Form.Label>Rubro</Form.Label>
								<InputGroup hasValidation>
									<Form.Control type="text" 
										readOnly
										disabled
										placeholder="Rubro proveedor"
										value={datosProveedor.descripcionRubro}
									>
								</Form.Control>
								</InputGroup>
							</Form.Group>
						</Row>
						<Row className="mb-3">
							<Form.Group as={Col} md="6" controlId="formNombre">
								<Form.Label>Nombre</Form.Label>
								<InputGroup hasValidation>
									<Form.Control type="text" 
										readOnly
										disabled
										placeholder="Nombre proveedor"
										value={datosProveedor.nombreProveedor}
									/>
								</InputGroup>
							</Form.Group>
							<Form.Group as={Col} md="6" controlId="formDireccion">
								<Form.Label>Dirección</Form.Label>
								<InputGroup hasValidation>
									<Form.Control type="text" 
										readOnly
										disabled
										placeholder="Dirección"
										value={datosProveedor.direccionProveedor}
									/>
								</InputGroup>
							</Form.Group>
						</Row>
						<Row className="mb-3">
							<Form.Group as={Col} md="6" controlId="formTelefono">
								<Form.Label>Teléfono</Form.Label>
								<InputGroup hasValidation>
									<Form.Control type="text" 
										readOnly
										disabled
										placeholder="Teléfono proveedor"
										value={datosProveedor.telefonoProveedor}
									/>
								</InputGroup>
							</Form.Group>
							<Form.Group as={Col} md="6" controlId="formCorreo">
								<Form.Label>Correo</Form.Label>
								<InputGroup hasValidation>
									<Form.Control type="text" 
										readOnly
										disabled
										placeholder="Correo proveedor"
										value={datosProveedor.correoProveedor}
									/>
								</InputGroup>
							</Form.Group>
						</Row>
						<Row className="mb-3">
							<Form.Group as={Col} md="12" controlId="formObservaciones">
								<Form.Label>Observaciones</Form.Label>
								<InputGroup hasValidation>
									<Form.Control as="textarea" rows={3}
										readOnly={readOnly}
										disabled={readOnly}
										placeholder="Ingrese las observaciones de la orden"
										value={detalleOrden.observaciones}
										onChange={e => {
											(setDetalleOrden({
												...detalleOrden,
												observaciones: e.target.value
											})
											), 
										setIsError({...isError, observaciones: false})}
										}
										isInvalid={isError.observaciones}
									/>
								<Form.Control.Feedback type="invalid">
									{msgErrors.observacionesError}
								</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>
						</Row>
						<Row className="mb-3">
							<Form.Group as={Col} md="6" controlId="formRubro">
								<Form.Label>Producto</Form.Label>
								<InputGroup hasValidation>
									<Form.Select aria-label="Producto"
										readOnly={readOnly}
										disabled={readOnly}
										onChange={e => {
											(setDetalleOrden({
												...detalleOrden,
												producto: e.target.value
												})
											), 
											setIsError({...isError, producto: false, cantidad: false}),
											setReadOnlyProducto(false)
											obtenerPrecioCompra(e.target.value)
										}}
										isInvalid={isError.producto}
									>
										<option hidden value={0}>Seleccione un producto</option>
										{
											listadoProductos.map((item, index) => (
												<option value={item.id} key={index}>{item.descripcionProducto}</option>
											))
										} 
									</Form.Select>
									<Form.Control.Feedback type="invalid">
										{msgErrors.productoError}
									</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>
							<Form.Group as={Col} md="2" controlId="formCantidad">
								<Form.Label>Cantidad</Form.Label>
								<InputGroup hasValidation>
									<Form.Control type="number" 
										readOnly={readOnlyProducto}
										disabled={readOnlyProducto}
										placeholder="Cantidad"
										value={suma.cantidad}
										onChange={e => {
											if(e.target.value < 0) {
												e.target.value = 0
											}
											(setSuma({
												...suma,
												cantidad: e.target.value
											})
											),
											setIsError({...isError, cantidad: false})}
											}
										isInvalid={isError.cantidad}
									/>
									<Form.Control.Feedback type="invalid">
										{msgErrors.cantidadError}
									</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>
							<Form.Group as={Col} md="2" controlId="formTotal">
								<Form.Label>Total (iva inc)</Form.Label>
								<InputGroup hasValidation>
									<Form.Control type="text" 
										readOnly
										disabled
										//placeholder="0"
										value={detalleProducto.precioCompraProducto}
										onChange={e => {
											(setSuma({
												...suma,
												precio: e.target.value
											}))
											}
										}
									/>
								</InputGroup>
							</Form.Group>
							<Form.Group as={Col} md="2" controlId="formRut">
							<Form.Label></Form.Label>
							<InputGroup hasValidation>
								<DialogActions>
								<Button variant="primary" 
								hidden={agregando}
								disabled={readOnly}
								onClick={agregarProducto}>
									Agregar
								</Button>
								<Button variant="primary" hidden={agregarHidden} disabled={agregando}>
								<Spinner
								as="span"
								animation="border"
								size="sm"
								role="status"
								aria-hidden="true"
								/> ..Guardando
								</Button>
								</DialogActions>
							</InputGroup>
							</Form.Group>
						</Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="12" controlId="formRut">
                                <Grid item xs={6} sm={12}>
                                    <CommonTable data={detalleOrdenCompra} columns={columnsDetail} autoHeight={false}/>    
                                </Grid>       
                            </Form.Group>
                        </Row>
						<DialogActions>
							<Button variant="secondary" onClick={handleShowDelete}>
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
           <Page title="YUYITOS | rubros">
				<Container maxWidth='xl'>
					<Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de odenes de compra</Typography>
					</Box>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={9}>
									<Button variant="primary" onClick={changeModal}>
									Nueva orden de compra
									</Button>
								</Col>
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>
					{/**DATA TABLE */}
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoOrdenCompra} columns={columns} autoHeight={false}/>
						</Grid>
					</Grid>
				</Container>
			</Page>
        </>
    );
}

export default OrdenCompra;