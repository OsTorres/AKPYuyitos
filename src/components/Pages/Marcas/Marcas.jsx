import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { EditOutlined, DeleteOutline, Close } from '@mui/icons-material'
import Page from '../../common/Page'
import CommonTable from '../../common/CommonTable'
import Swal from 'sweetalert2';
import { Modal, Button, Row, Form, InputGroup, Col, Spinner } from 'react-bootstrap';
import swal from 'sweetalert2/dist/sweetalert2.all.min.js'

const Marcas = () => {

	const [marca, setMarca] = useState({
		descripcionMarca: ""
	})

	const [errorsMarca, setErrorMarca] = useState({
		descripcionMarcaError: ""
	})

	const [isError, setIsError] = useState(false);
	const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false), setIsError(false)};
    const handleShow = () => {setShow(true), setBotones()};
	const [idEdit, setIdEdit] = useState(null);
	const [isEdit, setIsEdit] = useState(false);
    const [listadoMarcas, setListadoMarcas] = useState([]);
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);

    const init = async () => {
		const { data } = await ApiRequest().get(`/marcas`);
		setListadoMarcas(data)
	}

	const initId = async (buscar) => {

		if(buscar.length) {
			const { data } = await ApiRequest().get(`/marcas-filtro/${buscar}`)
			setListadoMarcas(data);	
		} else {
			init();
		}
		
	}

    const columns = [
		{ field: 'id', headerName: 'identificador', width: 230 },
        { field: 'descripcionMarca', headerName: 'Nombre marca', width: 812 },
		{
			field: '',
			headerName: 'Acciones',
			width: 444,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} 
                justifyContent="center" alignItems="center" spacing={4}>
					<Button size='sm' onClick={() => {
						setIsEdit(true);
						handleEdit(params.row)
					}}>
						<EditOutlined />
					</Button>
					<Button variant="danger" size='sm' onClick={() => {
						eliminarRubro(params.row.id)
					}}>
						<DeleteOutline  />
					</Button>
				</Stack>
			)
		}
	]

    const handleEdit = (row) => {
		setIdEdit(row.id)
		setMarca({descripcionMarca: row.descripcionMarca})
		handleShow()
	}

	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/rubros/${id}`)
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: data.message,
				showConfirmButton: true,
				timer: 2500
			})
		init();
	}

	const eliminarRubro = (id) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar esta marca?!",
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

	const changeModal = () => {
		setMarca({
			...marca,
			descripcionMarca: ""
		})
		handleShow();
		setGuardando(false);
		setIsEdit(false);	
	}

	function setBotones () {
		setGuardando(false);
		setGuardandoHidden(true);
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setGuardando(true);
		setGuardandoHidden(false);
		if(isEdit == false) {
			const { data } = await ApiRequest().post(`/marcas`, marca);
			if(data.errors == undefined) {
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				handleClose();
				init();		
			} else {
				setErrorMarca({
					...errorsMarca,
					descripcionMarcaError: data.errors[0].msg
				})	
				setIsError(true);	
				setBotones();
			}		
		} else {
			const { data } = await ApiRequest().put(`/marcas/${idEdit}`, marca)

			if(data.errors == undefined) {
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
				setErrorMarca({
					...errorsMarca,
					descripcionMarcaError: data.errors[0].msg
				})	
				setIsError(true);
				setBotones();	
			}
		}
	}

    useEffect(init, [])

    return(
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
						{isEdit ? 'Editar marca' : 'Agregar marca'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate onSubmit={handleSubmit}>
						<Form.Group className="mb-3" controlId="formDescripcion">
							<Form.Label>Nombre marca</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="text" 
									placeholder="Ingrese el nombre de la marca"
									value={marca.descripcionMarca}
									onChange={e => (
										setMarca({
											...marca,
											descripcionMarca: e.target.value
										}), 
										setIsError(false))}
										isInvalid={isError}
								    />
								<Form.Control.Feedback type="invalid">
									{errorsMarca.descripcionMarcaError}
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
						<DialogActions>
							{/* BOTON GUARDAR */}
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

           <Page title="YUYITOS | marcas">
				<Container maxWidth='xl'>
					<Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de marcas</Typography>
					</Box>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={9}>
									<Button variant="primary" onClick={changeModal}>
									Nueva marca
									</Button>
								</Col>
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>
					{/**DATA TABLE */}
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoMarcas} columns={columns} autoHeight={false}/>
						</Grid>
					</Grid>
				</Container>
			</Page>
        </>
    );

}

export default Marcas;