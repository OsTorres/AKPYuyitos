import React, {useState, useEffect} from 'react';
import Page from '../../common/Page'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { Modal, Button, Row, Form, InputGroup, Col, Spinner   } from 'react-bootstrap';
import { EditOutlined, DeleteOutline, Close, RemoveRedEyeSharp, LabelImportantOutlined } from '@mui/icons-material'
import CommonTable from '../../common/CommonTable';
import ApiRequest from '../../../helpers/axiosInstances';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import { renderToString } from "react-dom/server";
import autoTable from 'jspdf-autotable';
import { PDFObject } from "react-pdfobject";
import imagesList from '../../../assets/';

const Fiados = (props) => {

	const [fiadoData, setFiadoData] = useState({
		fechaPago: "",
		idCliente: "",
		idVenta: "",
		total: ""
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

	const [ventaData, setVentaData] = useState({
		idVenta: "",
		idCliente: "",
		idTipoPago: "",
		idTipoDocumento: "",
		vuelto: "",
		pagado: "",
		total: "",
		fecha: "",
		totalDefault: 0
	})

	const [idFiado, setIdFiado] = useState();
    const [listadoFiados, setListadoFiados] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false)};
    const handleShow = () => {setShow(true), setBotones(), setErrroresFomr()};
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);
	const [listadoDocumentos, setListadoDocumentos] = useState([]);
	const [listadoTipoPago, setListadoTipoPago] = useState([]);
	const [pagadoCaja, setPagadoCaja] = useState({pagado: 0, total: 0, realizar: 0, tarjeta: 0});
	const [disabledPagadoEfectivo, setDisabledPagadoEfectivo] = useState(false)
	const [disabledPagadoTarjeta, setDisabledPagadoTarjeta] = useState(true)

    const init = async () => {
		const { data } = await ApiRequest().get(`/listar-fiados`);
		setListadoFiados(data)
	}

	const[showModalFiado,setShowModalFiado] = useState(false);
	const handleShowModalFiado = ()=>{setShowModalFiado(true)};
	const handleCloseModalFiado = ()=>{setShowModalFiado(false)};

	const initId = async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/fiados/${buscar}`)
			setListadoFiados(data);	
		} else {
			init() 
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

	// combo box caja
	const obtenerTipoPago = async () => {
		const { data } = await ApiRequest().get(`/tipos-pagos`);
		setListadoTipoPago(data)
	}

	const obtenerTipoDocumento = async () => {
		const { data } = await ApiRequest().get(`/tipos-documentos`);

		let dataDoc = []
		data.map((item)=> {
			if(item.id != 4) {
				dataDoc.push({"id": item.id, "nombreDocumento": item.nombreDocumento})
			}		
		});	
		setListadoDocumentos(dataDoc)
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

			const { data } = await ApiRequest().put(`/fiados/${idFiado}`, ventaData);
			if(data.errors == undefined) {
				//mensaje de confirmación de registro guardado
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				generarPdf(data.idVenta)
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

	const setColor = (fueraPlazo) => {
		if(fueraPlazo == '1') {
			return "green";
		} else if( fueraPlazo == '0'){
			return "red";	
		} 	
	}



    const columns = [
        { field: 'nombreCliente', headerName: 'Cliente', width: 200 },
		{ field: 'telefonoCliente', headerName: 'Contacto', width: 200 }, 
        { field: 'fechaEmisionFiado', headerName: 'Fecha emision', width: 200 },
        { field: 'fechaPagoFiado', headerName: 'Fecha pago', width: 200 },
        { field: 'totalVenta', headerName: 'Total', width: 200 },
		{ field: 'nombreEstado', headerName: 'Estado', width: 100 },
        { field: 'nombreEstado', headerName: 'Estado', width: 150, renderCell: (params)=> (
            <Typography style={{fontSize: "8"}}>{params.getValue(params.id, 'nombreEstado')}
            <LabelImportantOutlined  style={{color: setColor(params.getValue(params.id, 'fueraPlazo'))}}/></Typography>
            )  
		},
		{
			field: '',
			headerName: 'Acciones',
			width: 400,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} 
                justifyContent="center" alignItems="center" spacing={4}>
					<Button variant="primary" size='sm' onClick={() => {
						handleEditFiado(params.row)
					}}>
						<EditOutlined  />
					</Button>
					<Button variant="info" size='sm' onClick={() => {
						generarPdf(params.row.idVenta)
					}}>
						<RemoveRedEyeSharp  />
					</Button>
				</Stack>
			)
		}
	]

	const handleEditFiado = (e) => {
		setIdFiado(e.id);
		setVentaData({...ventaData,
			idVenta: e.idVenta,
			idCliente: e.idCliente,
			idTipoPago: "",
			idTipoDocumento: "",
			vuelto: 0,
			pagado: 0,
			total: e.totalVenta,
			fecha: e.fechaPagoFiado,
			totalDefault: e.totalVenta,
		})
		setPagadoCaja({...pagadoCaja, total: e.totalVenta})
		handleShowModalFiado()
	}

    useEffect(init, [])

	useEffect(() =>{
		obtenerTipoPago();
		obtenerTipoDocumento();
	}, [])

	useEffect(()=>{
		const {pagado, total, realizar, tarjeta} = pagadoCaja
		if(realizar > 0) {
			if(tarjeta == 1) {
				setVentaData({
					...ventaData,
					vuelto: 0,
					pagado: total
				})
			} else {
				if((pagado - total) > 0 ) {
					setVentaData({
						...ventaData,
						vuelto: (pagado - total),
						pagado: pagado,
						total: total,
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

	const isEfectivo = (e) => {
		if(e == 1) {
			setDisabledPagadoEfectivo(false);	
			setDisabledPagadoTarjeta(true)
		} else {
			setDisabledPagadoEfectivo(true);
			setDisabledPagadoTarjeta(false);
		}
	}

    return(
        <>
		<Dialog maxWidth='md' fullWidth open={showModalFiado}>
				<DialogTitle>
					<IconButton aria-label="close"
						onClick={handleCloseModalFiado}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close></Close>
					</IconButton>
						{isEdit ? 'Editar fiado' : 'Agregar fiado'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate onSubmit={handleSubmit}>
						<Row className="mb-3">
						<Form.Group as={Col} md="6" controlId="formTipoDocumento">
											<Form.Label>Tipo documento</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Tipo documento"
													value={ventaData.idTipoDocumento}
													onChange={e => {
														(setVentaData({
															...ventaData,
															idTipoDocumento: e.target.value
														}))
														isEfectivo(e.target.value)
														if(e.target.value == 2) {
															setPagadoCaja({...pagadoCaja, tarjeta: 1, realizar: 1})
														}
														
														setIsError({...isError, idCategoria: false})}
														}
													isInvalid={isError.idCategoria}>
											<option hidden value={0}>Seleccione un tipo de pago</option>
											{
												listadoTipoPago.map((item, index) => (
												<option value={item.id} key={index}>{item.nombreTipoPago}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.idCategoriaError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formTipoPago">
											<Form.Label>Tipo pago</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Tipo pago"
													//value={productosData.idCategoria}
													onChange={e => {
														(setVentaData({
															...ventaData,
															idTipoPago: e.target.value
														})
														), 
														setIsError({...isError, idCategoria: false})}
														}
													isInvalid={isError.idCategoria}>
											<option hidden value={0}>Seleccione un tipo de documento</option>
											{
												listadoDocumentos.map((item, index) => (
												<option value={item.id} key={index}>{item.nombreDocumento}</option>
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
										<Form.Group as={Col} md="6" controlId="formFechaPago">
											<Form.Label>Fecha pago</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Fecha de pago"
														value={ventaData.fecha}
														disabled
														/>
											<Form.Control.Feedback type="invalid">
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formTotalFiado">
											<Form.Label>Total fiado</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Total fiado"
														value={ventaData.total}
														disabled
														/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.correoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
						</Row>
						<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formPagado">
											<Form.Label>Pagado</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
													    hidden={disabledPagadoTarjeta} 
														disabled
														value={ventaData.total}					
														/>
											<Form.Control type="text" 
														placeholder="Ingrese monto a pagar"
														hidden={disabledPagadoEfectivo}
														defaultValue={0}
														onChange={e => {
															(setPagadoCaja({...pagadoCaja, pagado: e.target.value, realizar: 1})
											
															), 
															setIsError({...isError, telefono: false})}
															}
														isInvalid={isError.telefono}/>

											<Form.Control.Feedback type="invalid">
												{msgErrors.telefonoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formVuelto">
											<Form.Label>Vuelto</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Vuelto"
														value={ventaData.vuelto}
														disabled
														isInvalid={isError.telefono}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.telefonoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										
						</Row>
									
						<DialogActions>
							<Button variant="secondary" onClick={handleCloseModalFiado}>
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
            <Page title="YUYITOS | fiados">
                <Container maxWidth='xl'>
                    <Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de fiados</Typography>
					</Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            {/**BOTON PARA ABRIR MODAL */}
                            <Row >
                                <Col  xl={3}>
                                    <Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
                                </Col>
                            </Row>
                        </Grid>
                        {/**DATA TABLE */}
                        <Grid item xs={12} sm={12}>
                            <CommonTable data={listadoFiados} columns={columns} autoHeight={false}/>
                        </Grid>     
                    </Grid>
                </Container>
            </Page>
        </>     
    )

}

export default Fiados;