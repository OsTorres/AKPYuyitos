import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Box, Stack, Avatar, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { EditOutlined, DeleteOutline, Close } from '@mui/icons-material'
import Page from '../../common/Page'
import { Modal, Button, Row, Form, InputGroup, Col, Spinner } from 'react-bootstrap';
import CommonTable from '../../common/CommonTable'
import Swal from 'sweetalert2';

const Proveedores = () => {

	//DATOS DEL PROVEEDOR PARA TRAER O ENVIAR A BACKEND
	const [proveedorData, setProveedorData] = useState({
		rut: "",
		nombre: "",
		telefono: "",
		telefono2: "",
		correo: "",
		razonSocial: "",
		direccion: "",
		rubro: "",
		comuna: "",
		region: ""	
	});

	//VARIABLES PARA EL MENSAJE DE ERROR
	const [msgErrors, setMsgErrors] = useState({
		rutError: "",
		nombreError: "",
		telefonoError: "",
		telefono2Error: "",
		correoError: "",
		razonSocialError: "",
		direccionError: "",
		rubroError: "",
		comunaError: "",
		regionError: ""	
	});

	//VARIABLES PARA VERIFICAR QUE CAMPO NECESITA SER VALIDADO (TRUE: BIEN, FALSE: VALIDAR)
	const [isError, setIsError] = useState({
		rut: false,
		nombre: false,
		telefono: false,
		telefono2: false,
		correo: false,
		razonSocial: false,
		direccion: false,
		rubro: false,
		comuna: false,
		region: false	
	});

	//CON ESTA FUNCIÓN RECUPERO LA ID DEL PROVEEDOR
	const [idProveedor, setIdProveedor] = useState(null);

	//METODO PARA VERIFICAR SI ESTA EDITANDO O CREANDO UN REGISTRO
	const [isEdit, setIsEdit] = useState(false)
	//LISTADO DE PROVEEDORES PARA EL DATA TABLE
	const [listadoProveedores, setListadoProveedores] = useState([])
	//LISTADO DE RUBROS PARA EL COMBO BOX
	const [rubros, setRubro] = useState([]);
	//LISTADO DE REGIONES PARA EL COMBO BOX
	const [regiones, setRegiones] = useState([]);
	//LISTADO DE COMUNAS PARA EL LISTADOD DE COMUNAS
	const [comunas, setComunas] = useState([]);
	//METODO PARA ABRIR EL MODAL
	const [show, setShow] = useState(false);
	//CIERRO MODAL
	const handleClose = () => {setShow(false), setIsError({
		rut: false,
		nombre: false,
		telefono: false,
		telefono2: false,
		correo: false,
		razonSocial: false,
		direccion: false,
		rubro: false,
		comuna: false,
		region: false	
	})};
	//ABRO MODAL
    const handleShow = () => {setShow(true), setBotones()};
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);

	//CON ESTA FUNCION LLENO EL DATA TABLE ADEMAS PUEDO HACER USO DEL USE EFFECT PARA Q CADA VEZ Q SE HAGA UN CAMBIO LO MUESTRE 
	//EQUIVALE A UN GET DATA TABLE Y UN TABLE DESTROY AL MISMO TIEMPO
	const init = async () => {
		const { data } = await ApiRequest().get('/listar-proveedor');
		setListadoProveedores(data);
	}

	const initId = async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/proveedor/${buscar}`)
			setListadoProveedores(data);	
		} else {
			init()
		}
	}

	//en field debe ir el nombre de la columna (OJO--> TAL CUAL COMO SE LLAMA EN SU ALIAS)
	const columns = [
		{ field: 'rutProveedor', headerName: 'Rut', width: 100 },
		{ field: 'nombreProveedor', headerName: 'Nombre', width: 150 },
        { field: 'telefonoProveedor', headerName: 'Teléfono 1', width: 100 },
		{ field: 'correoProveedor', headerName: 'Correo', width: 150 },
		{ field: 'razonSocialProveedor', headerName: 'Razón social', width: 150 },
		{ field: 'direccionProveedor', headerName: 'Dirección', width: 150 },
		{ field: 'descripcionRubro', headerName: 'Rubro', width: 200 },
		{ field: 'nombreComuna', headerName: 'Comuna', width: 150 },
		{ field: 'nombreRegion', headerName: 'Región', width: 150 },
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
						{/**ESTA ES LA FUNCION DE EDITAR, OBTENGO PARAMS ROW (OSEA TODO EL DATA TABLE INCLUSO DATOS OCULTOS
						DESCOMENTAR EL CONSOLE LOG PARA VERIFICAR X CONSOLA) */}
						handleEdit(params.row);
						//console.log(params.row)
					}}>
						<EditOutlined />
					</Button >
					<Button variant="danger" size='sm' onClick={() => {
						//función para eliminar (recupero la id del data table)
						eliminarProveedor(params.row.id);
					}}>
						<DeleteOutline />
					</Button >
				</Stack>
			)
		}
	]

	//seteo los valores de proveedor del data table (segun id)
	const handleEdit = (values) => {
		setIdProveedor(values.id);
		//obtengo las comunas segun region id
		obtenerComunaRegion(values.regionId);

		setProveedorData({
			...proveedorData,
			rut: values.rutProveedor,
			nombre: values.nombreProveedor,
			telefono: values.telefonoProveedor,
			telefono2: values.telefono2Proveedor,
			correo: values.correoProveedor,
			razonSocial: values.razonSocialProveedor,
			direccion: values.direccionProveedor,
			rubro: values.rubroId,
			comuna: values.comunaId,
			region: values.regionId	
		})
		//abro el modal
		handleShow();
		//seteo el editar en true
		setIsEdit(true);
	}

	//todo el listado de rubros
	const listadoDeRubros = async () => {
		const { data } = await ApiRequest().get(`/rubros`);
		setRubro(data);
	}

	//todo el listado de regiones
	const listadoDeRegiones = async () => {
		const { data } = await ApiRequest().get('/regiones');
		setRegiones(data);
	}

	//para obtener el listado de comunas por region segun id region
	const obtenerComunaRegion = async (id) => {
		const { data } = await ApiRequest().get(`/comunas/${id}`)
		setComunas(data);
	}

	//Con este metodo se abre el modal para agregar nuevo proveedor
	const changeModal = () => {
		//no esta editando asi que cambia el valor a falso
		setIsEdit(false);

		//seteo las comunas en null
		obtenerComunaRegion(null);

		//seteo los valores en vacio
		setProveedorData({
			...proveedorData,
			rut: "",
			nombre: "",
			telefono: "",
			telefono2: "",
			correo: "",
			razonSocial: "",
			direccion: "",
			rubro: "",
			comuna: "",
			region: ""	
		})
		//abro el modal
		handleShow();
	}

	//METODO PARA ELIMINAR PROVEEDOR (LA ID SE OBTIENE AL DARLE CLICK AL BASURERO)
	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/proveedor/${id}`)
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
			text: "¿Deseas eliminar este rubro?!",
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
		e.preventDefault();
		setGuardando(true);
		setGuardandoHidden(false);
		//IMPORTANTE esta condicion verifica que la data no contenga errores, si los tiene pasa al else y valida
		//este metodo funciona en cualquier jsx NO MODIFICAR

		//CREAR PROVEEDOR
		if(isEdit == false) {
			const { data } = await ApiRequest().post(`/proveedor`, proveedorData);
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
			const { data } = await ApiRequest().put(`/proveedor/${idProveedor}`, proveedorData);
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
		listadoDeRubros();
		listadoDeRegiones();
    },[]);
	//efecto para mostrar cambios en el data table
	useEffect(init, [])

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
						{isEdit ? 'Editar proveedor' : 'Agregar proveedor'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate onSubmit={handleSubmit}>
					<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formRut">
											<Form.Label>Rut</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un rut"
														value={proveedorData.rut}
														onChange={e => {
															(setProveedorData({
																...proveedorData,
																rut: e.target.value
															})
															), 
															setIsError({...isError, rut: false})}
															}
														isInvalid={isError.rut}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.rutError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formNombre">
											<Form.Label>Nombre</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un nombre"
														value={proveedorData.nombre}
														onChange={e => {
															(setProveedorData({
																...proveedorData,
																nombre: e.target.value
																})
															), 
															setIsError({...isError, nombre: false})}
															}
														isInvalid={isError.nombre}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.nombreError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formTelefono1">
											<Form.Label>Teléfono 1</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
													placeholder="Ingrese un número de teléfono 1"
													value={proveedorData.telefono}
													onChange={e => {
															(setProveedorData({
															...proveedorData,
															telefono: e.target.value
															})
														), 
														setIsError({...isError, telefono: false})}
														}
													isInvalid={isError.telefono}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.telefonoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>

										<Form.Group as={Col} md="6" controlId="formTelefono2">
											<Form.Label>Teléfono 2</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un número de teléfono 2"
														value={proveedorData.telefono2}
														onChange={e => {
															(setProveedorData({
																...proveedorData,
																telefono2: e.target.value
															})
															), 
															setIsError({...isError, telefono2: false})}
															}
														isInvalid={isError.telefono2}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.telefono2Error}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formCorreo">
											<Form.Label>Correo</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese un correo"
														value={proveedorData.correo}
														onChange={e => {
															(setProveedorData({
																...proveedorData,
																correo: e.target.value
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
										<Form.Group as={Col} md="6" controlId="formRazonSocial">
											<Form.Label>Razón social</Form.Label>
												<InputGroup hasValidation>
													<Form.Control type="text" 
															placeholder="Ingrese una razón social"
															value={proveedorData.razonSocial}
															onChange={e => {
																(setProveedorData({
																...proveedorData,
																razonSocial: e.target.value
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
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formRubro">
											<Form.Label>Región</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Rubro"
														value={proveedorData.region}
														onChange={e => {
															(setProveedorData({
															...proveedorData,
															region: e.target.value
															})
														), setIsError({...isError, region: false}),
														obtenerComunaRegion(e.target.value)
														}
														}
														isInvalid={isError.region}>
											<option hidden value={0}>Seleccione una región</option>
											{
												regiones.map((item, index) => (
													<option value={item.id} key={index}>{item.nombreRegion}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.regionError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>

										<Form.Group as={Col} md="6" controlId="formRubro">
											<Form.Label>Rubro</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Rubro"
														value={proveedorData.rubro}
														onChange={e => {
															(setProveedorData({
															...proveedorData,
															rubro: e.target.value
															})
														), setIsError({...isError, rubro: false})}
														}
														isInvalid={isError.rubro}>
											<option hidden value={0}>Seleccione un rubro</option>
											{
												rubros.map((item, index) => (
													<option value={item.id} key={index}>{item.descripcionRubro}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.rubroError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
									</Row>
									<Row className="mb-3">
									<Form.Group as={Col} md="6" controlId="formComuna">
											<Form.Label>Comuna</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Comuna"
													value={proveedorData.comuna}
													onChange={e => {
														(setProveedorData({
															...proveedorData,
															comuna: e.target.value
														})
														), 
														setIsError({...isError, comuna: false})}
														}
													isInvalid={isError.comuna}>
											<option hidden value={0}>Seleccione una comuna</option>
											{
												comunas.map((item, index) => (
													<option value={item.id} key={index}>{item.nombreComuna}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{msgErrors.comunaError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>

										<Form.Group as={Col} md="6" controlId="formDescripcion">
											<Form.Label>Direccion</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese descripción de rubro"
														value={proveedorData.direccion}
														onChange={e => {
															(setProveedorData({
																...proveedorData,
																direccion: e.target.value
															})
															), 
															setIsError({...isError, direccion: false})}
															}
														isInvalid={isError.direccion}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.direccionError}
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

			<Page title="YUYITOS | proveedores">
			
				<Container maxWidth='xl'>
					<Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de proveedores</Typography>
					</Box>
					
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={9}>
									<Button variant="primary" onClick={changeModal}>
									Nuevo Proveedor
									</Button>
								</Col>
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>
					
					
															
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoProveedores} columns={columns} autoHeight={false}/>
						</Grid>
					</Grid>
				</Container>
			</Page>
		</>
	)
}

export default Proveedores;
