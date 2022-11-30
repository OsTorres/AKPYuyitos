import React, { useState, useEffect } from 'react'
import { TextField, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, 
	Container, Typography, Grid, Box, Button, Stack, Avatar, IconButton, Divider, Select } from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { AddOutlined, EditOutlined, DeleteOutline } from '@mui/icons-material'
import Page from '../../common/Page'
import ToastAutoHide from '../../common/ToastAutoHide'
import CommonTable from '../../common/CommonTable'
import imagesList from '../../../assets'

const Usuarios = () => {
	const initialState = {
		avatar: 'https://i.imgur.com/gh3fPj5.png',
		nombre: "",
		planeta: ""
	}
	const [usuariosList, setUsuariosList] = useState([])
	const [body, setBody] = useState(initialState)
	const [openDialog, setOpenDialog] = useState(false)
	const [isEdit, setIsEdit] = useState(false)
	const [mensaje, setMensaje] = useState({ ident: null, message: null, type: null })
	const [idDelete, setIdDelete] = useState(null)
	const [openDialogDelete, setOpenDialogDelete] = useState(false)
	const init = async () => {
		const { data } = await ApiRequest().get('/listar-productos')
		setUsuariosList(data)
	}

	const listadoAll = async () => {
		let data = await ApiRequest().get('/listar-productos')
		console.log(data)
	}

	const columns = [
		{ field: 'id', headerName: 'id', width: 120 },
		{
			field: 'Foto',
			headerName: 'Foto',
			width: 200,
			renderCell: (params) => (
				<Avatar src={imagesList.Logo} />
			)
		},
		{ field: 'descripcion', headerName: 'descripcion', width: 220 },
		{ field: 'stock_critico', headerName: 'stock_critico', width: 220 },
		{ field: 'valor_unitario', headerName: 'valor_unitario', width: 220 },
		{
			field: '',
			headerName: 'Acciones',
			width: 200,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={2}>
					<IconButton size='small' onClick={() => {
						setIsEdit(true)
						setBody(params.row)
						handleDialog()
					}}>
						<EditOutlined />
					</IconButton>
					<IconButton size='small' onClick={() => {
						handleDialogDelete()
						setIdDelete(params.id)
					}}>
						<DeleteOutline />
					</IconButton>
				</Stack>
			)
		}
	]

	const onDelete = async () => {
		try {
			const { data } = await ApiRequest().post('/eliminar', { id: idDelete })
			setMensaje({
				ident: new Date().getTime(),
				message: data.message,
				type: 'success'
			})
			handleDialogDelete()
			init()
		} catch ({ response }) {
			setMensaje({
				ident: new Date().getTime(),
				message: response.data.sqlMessage,
				type: 'error'
			})
		}
	}

	const handleDialog = () => {
		setOpenDialog(prev => !prev)
	}

	const handleDialogDelete = () => {
		setOpenDialogDelete(prev => !prev)
	}

	const onChange = ({ target }) => {
		const { name, value } = target
		setBody({
			...body,
			[name]: value
		})
	}

	const onSubmit = async () => {
		try {
			if (body.nombre === "" || body.planeta === "") {
				setMensaje({
					ident: new Date().getTime(),
					message: "Todos los campos son requeridos",
					type: 'info'
				})
			} else {
				const { data } = await ApiRequest().get('listar-datos', body)
				handleDialog()
				setBody(initialState)
				setMensaje({
					ident: new Date().getTime(),
					message: data.message,
					type: 'success'
				})
				init()
				setIsEdit(false)
			}
		} catch ({ response }) {
			setMensaje({
				ident: new Date().getTime(),
				message: response.data.sqlMessage,
				type: 'error'
			})
		}
	}

	const onEdit = async () => {
		try {
			const { data } = await ApiRequest().post('/editar', body)
			handleDialog()
			setBody(initialState)
			setMensaje({
				ident: new Date().getTime(),
				message: data.message,
				type: 'success'
			})
			init()
			setIsEdit(false)
		} catch ({ response }) {
			setMensaje({
				ident: new Date().getTime(),
				message: response.data.sqlMessage,
				type: 'error'
			})
		}
	}

	useEffect(init, [])

	return (
		<>
			<Dialog maxWidth='xs' open={openDialogDelete} onClose={handleDialogDelete}>
				<DialogTitle>
					¿Desea realmente eliminar a este usuario?
				</DialogTitle>
				<DialogContent>
					<Typography variant='h5'>Recuerda que esta acción es irreversible</Typography>
				</DialogContent>
				<DialogActions>
					<Button variant='text' color='primary' onClick={handleDialogDelete}>cancelar</Button>
					<Button variant='contained' color='primary' onClick={onDelete}>aceptar</Button>
				</DialogActions>
			</Dialog>
			<Dialog maxWidth='xl' open={openDialog} onClose={handleDialog}>
				<DialogTitle>
					{isEdit ? 'Editar Usuario' : 'Crear Usuario'}
				</DialogTitle>
				<DialogContent>
					<Grid container spacing={12}>
						<Grid item xs={12} sm={12}>
							<Avatar src={body.avatar} />
						</Grid>
						<Grid item xs={6} sm={6}>
							<TextField
								margin='normal'
								name='nombre'
								value={body.nombre}
								onChange={onChange}
								variant='outlined'
								size='small'
								color='primary'
								fullWidth
								label='Nombre'
							/>
						</Grid>
						<Grid item xs={6} sm={6}>
							<TextField
								margin='normal'
								name='nombre'
								value={body.nombre}
								onChange={onChange}
								variant='outlined'
								size='small'
								color='primary'
								fullWidth
								label='Valor unitario'
							/>
						</Grid>
						<Grid item xs={12} sm={12}>
							<TextField
								margin='normal'
								name='planeta'
								value={body.planeta}
								onChange={onChange}
								variant='outlined'
								size='small'
								color='primary'
								fullWidth
								label='Planeta'
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button variant='text' color='primary' onClick={handleDialog}>cancelar</Button>
					<Button variant='contained' color='primary' onClick={isEdit ? () => onEdit() : () => onSubmit()}>guardar</Button>
				</DialogActions>
			</Dialog>
			<Page title="YUYITOS | Usuarios">
				<ToastAutoHide message={mensaje} />
				<Container maxWidth='lg'>
					<Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de usuarios</Typography>
					</Box>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={4}>
							<Button onClick={handleDialog} startIcon={<AddOutlined />} variant='contained' color='primary'>Nuevo</Button>
						</Grid>
						<Grid item xs={12} sm={8} />
						<Grid item xs={12} sm={12}>
							<CommonTable data={usuariosList} columns={columns} />
						</Grid>
					</Grid>
				</Container>
			</Page>
		</>
	)
}

export default Usuarios

