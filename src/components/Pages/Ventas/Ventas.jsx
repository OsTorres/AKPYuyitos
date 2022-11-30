import React, {useState, useEffect} from 'react';
import Page from '../../common/Page'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { Modal, Button, Row, Form, InputGroup, Col, Spinner   } from 'react-bootstrap';
import { EditOutlined, DeleteOutline, Close, RemoveRedEyeSharp } from '@mui/icons-material'
import CommonTable from '../../common/CommonTable';
import ApiRequest from '../../../helpers/axiosInstances';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import { renderToString } from "react-dom/server";
import autoTable from 'jspdf-autotable';
import { PDFObject } from "react-pdfobject";
import imagesList from '../../../assets/';
import { table } from '../../../helpers/table';

const Ventas = (props) => {

	const [datosUsuarios, setUsuarios] = useState({
		correo: "",
		contraseña: "",
		tipoUsuario: "",
		nombre: "",
		apellido: "",
		run: ""
	});

	//VARIABLES PARA EL MENSAJE DE ERROR
	const [msgErrors, setMsgErrors] = useState({
		runError: "",
		nombreError: "",
		apellidoError: "",
		correoError: "",
		telefonoError: ""
	});

	//VARIABLES PARA VERIFICAR QUE CAMPO NECESITA SER VALIDADO (TRUE: BIEN, FALSE: VALIDAR)
	const [isError, setIsError] = useState({
		run: false,
		nombre: false,
		apellido: false,
		correo: false,
		telefono: false
	});

	const [idCliente, setIdCliente] = useState();
    const [listadoClientes, setListadoClientes] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false)};
    const handleShow = () => {setShow(true), setBotones(), setErrroresFomr()};
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);

    const init = async () => {
		const { data } = await ApiRequest().get(`/listar-ventas`);
		setListadoClientes(data)
	}

	const initId = async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/cliente/${buscar}`)
			setListadoClientes(data);	
		} else {
			init() 
		}
	}

    const changeModal = () => {
        setIsEdit(false);
		setIdCliente();
		setDatosClientes({
			...datosClientes,
			run: "",
			nombre: "",
			apellido: "",
			correo: "",
			telefono: ""
		})
        handleShow()
    }

	function setErrroresFomr() {
		setIsError({
			isError,
			run: false,
			nombre: false,
			apellido: false,
			correo: false,
			telefono: false
		})
		setMsgErrors({
			...msgErrors,
			runError: "",
			nombreError: "",
			apellidoError: "",
			correoError: "",
			telefonoError: ""
		})
	}

	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/cliente/${id}`);
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
	const eliminarCliente = (id) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar este cliente?!",
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

    const handleSubmit = async (e) => {
		e.preventDefault();
		setGuardando(true);
		setGuardandoHidden(false);

		if(!isEdit) {
			const { data } = await ApiRequest().post(`/cliente`, datosClientes);
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
			
		} else {
			const { data } = await ApiRequest().put(`/cliente/${idCliente}`, datosClientes);
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

    const handleEdit = (values) => {
        
		setIdCliente(values.id)
		setDatosClientes({
			...datosClientes,
			run: values.runCliente,
			nombre: values.nombreCliente,
			apellido: values.apellidoCliente,
			correo: values.emailCliente,
			telefono: values.telefonoCliente
		})
		handleShow()
    }

	const generarPdf =  async (id) => {

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
		doc.setFont("Arial", "title");
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
                raw: "descripcionProducto",
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
                raw: "valorTotalFormat",
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
	
		// doc.autoTable({
		// columns:[
		// 		{ header: 'Código producto', dataKey: 'idProducto' },
		// 		{ header: 'Descripción producto', dataKey: 'descripcionProducto' },
		// 		{ header: 'Cantidad', dataKey: 'cantidad' },
		// 		{ header: 'Total compra', dataKey: 'valorTotalFormat' },
		// 	],

		// body:rowsDetalles,
		//   	margin:{top:225, horizontal: 45},
		// 	theme: "plain",
		
		// })
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

    const columns = [
        { field: 'nombreCliente', headerName: 'Cliente', width: 200 },
        { field: 'fechaEmision', headerName: 'Fecha emision', width: 200 },
        { field: 'totalIvaFormat', headerName: 'IVA', width: 200 },
        { field: 'totalNetoFormat', headerName: 'NETO', width: 200 },
        { field: 'totalVentaFormat', headerName: 'TOTAL', width: 200 },
		{ field: 'tipoDocumento', headerName: 'Tipo documento', width: 200 },   
		{
			field: '',
			headerName: 'Acciones',
			width: 400,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} 
                justifyContent="center" alignItems="center" spacing={4}>
					<Button variant="info" size='sm' onClick={() => {
						generarPdf(params.row.id)
					}}>
						<RemoveRedEyeSharp  />
					</Button>
				</Stack>
			)
		}
	]

    useEffect(init, [])

    return(
        <>
    

            <Page title="YUYITOS | ventas">
                <Container maxWidth='xl'>
                    <Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de ventas</Typography>
					</Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            {/**BOTON PARA ABRIR MODAL */}
                            <Row >
                                <Col  xl={9}>
                                    <Button variant="primary" onClick={changeModal}>
                                        Nuevo ventas
                                    </Button>
                                </Col>
                                <Col  xl={3}>
                                    <Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
                                </Col>
                            </Row>
                        </Grid>
                        {/**DATA TABLE */}
                        <Grid item xs={12} sm={12}>
                            <CommonTable data={listadoClientes} columns={columns} autoHeight={false}/>
                        </Grid>     
                    </Grid>
                </Container>
            </Page>
        </>     
    )

}

export default Ventas;