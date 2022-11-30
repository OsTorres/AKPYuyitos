import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Page from '../../common/Page'
import { useHistory } from 'react-router-dom'
import imagesList from '../../../assets'

const NotFound = () => {
	const { push } = useHistory()

	return (
		<Page title='404 | No encontrado'>
			<Box
				component="main"
				sx={{
					alignItems: 'center',
					display: 'flex',
					flexGrow: 1,
					minHeight: '100%',
					mt: 15
				}}
			>
				<Container maxWidth="lg">
					<Box
						sx={{
							alignItems: 'center',
							display: 'flex',
							flexDirection: 'column'
						}}
					>
						<Box sx={{ textAlign: 'center' }}>
							<img
								alt="Not Found"
								src={imagesList.notFound}
								style={{
									marginTop: 50,
									display: 'inline-block',
									maxWidth: '100%',
									width: 700
								}}
							/>
						</Box>
						<Typography
							align="center"
							color="textPrimary"
							variant="h2"
							sx={{ fontWeight: 'bold' }}
						>
							404 - La página que buscas no está aquí
						</Typography>
						<Typography
							align="center"
							color="textPrimary"
							variant="subtitle2"
						>
							O intentaste una ruta sombría o viniste aquí por error. Sea lo que sea, intenta usar la navegación.
						</Typography>
						<Button
							onClick={() => push('/')}
							startIcon={<ArrowBackIcon fontSize="small" />}
							sx={{ mt: 3 }}
							variant="contained"
						>
							Regresar al inicio
						</Button>
					</Box>
				</Container>
			</Box>
		</Page>
	)
}

export default NotFound