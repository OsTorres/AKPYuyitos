import React, { useState, useEffect } from 'react';
import ApiRequest from '../../../helpers/axiosInstances'
import { Box, Container, Typography, Grid } from '@mui/material';
import Page from '../../common/Page';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
// ----------------------------------------------------------------------
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	PointElement,
	LineElement
  );

  import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	PointElement,
	LineElement
  } from 'chart.js';
  

const Dashboard = () => {

	const [dataProductos, setDataProductos] = useState([]);
	const [topProductos, setTopProductos] = useState([]);
	const [ventasMensuales, setVentasMensuales] = useState([]);
	const [fiadosClientes, setFiadosClientes] = useState([]);

	const initProductos = async () => {
		const { data } = await ApiRequest().get(`/dashboard-productos`);
		setDataProductos(data)
	}

	const initTopProductos = async () => {
		const { data } = await ApiRequest().get(`/dashboard-productos-top`);
		setTopProductos(data)
	}

	const initVentasMensuales = async () => {
		const { data } = await ApiRequest().get(`/dashboard-ventas`);
		setVentasMensuales(data)
	}

	const initFiadosClientes = async () => {
		const { data } = await ApiRequest().get(`/dashboard-fiados`);
		setFiadosClientes(data)
	}

	const optionsProductos = {
		responsive: true,
		plugins: {
		  legend: {
			position: 'top',
		  },
		  title: {
			display: true,
			text: 'Reportes',
		  },
		},
	};
	  
	const dataProductosDashboard = {
		labels: dataProductos.map(item=> (item.descripcionProducto)),
		datasets: [
		  {
			label: 'Productos con mayor stock',
			data: dataProductos.map(item=> (item.stockProducto)),
			backgroundColor: 'rgba(255, 99, 132, 0.5)',
		  },
		],
	};

	const dataProductosVendidos = {
		labels: topProductos.map(item=> (item.descripcion)),
		datasets: [
		  {
			label: 'Cantidad: ',
			data: topProductos.map(item=> (item.cantidad)),
			backgroundColor: [
			  'rgba(255, 99, 132, 0.2)',
			  'rgba(54, 162, 235, 0.2)',
			  'rgba(255, 206, 86, 0.2)',
			  'rgba(75, 192, 192, 0.2)',
			  'rgba(153, 102, 255, 0.2)',
			],
			borderColor: [
			  'rgba(255, 99, 132, 1)',
			  'rgba(54, 162, 235, 1)',
			  'rgba(255, 206, 86, 1)',
			  'rgba(75, 192, 192, 1)',
			  'rgba(153, 102, 255, 1)',
			],
			borderWidth: 1,
		  },
		],
	};


	const dataFiadosDashboard = {
		labels: fiadosClientes.map(item=> (item.nombreEstado)),
		datasets: [
		  {
			label: 'Cantidad: ',
			data: fiadosClientes.map(item=> (item.cantidadEstado)),
			backgroundColor: [
			  'rgba(255, 99, 132, 0.2)',
			  'rgba(54, 162, 235, 0.2)',
			  'rgba(255, 206, 86, 0.2)',
			],
			borderColor: [
			  'rgba(255, 99, 132, 1)',
			  'rgba(54, 162, 235, 1)',
			  'rgba(255, 206, 86, 1)',
			],
			borderWidth: 1,
		  },
		],
	};

	const dataVentaMes = {
		labels: ventasMensuales.map(item=> (item.nombreMes)),
		datasets: [
		  {
			label: 'Total mes: ',
			data: ventasMensuales.map(item=> (item.total)),
			borderColor: "black",
			backgroundColor: "white"
		  }
		]
	}

	useEffect(()=>{
		initProductos();
		initTopProductos();	
		initVentasMensuales();	
		initFiadosClientes();
	}, [])

	return (
		<Page title=" | Dashboard">
			<Container maxWidth="xl">
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<Typography sx={{ mt: 3, fontWeight: 'bold' }} variant='h5'>Bienvenido a</Typography>
					<Typography sx={{ mt: 3, fontWeight: 'bold' }} variant='h2'> Proyecto Almacén los yuyitos</Typography>
				</Box>
				<hr />
				<Grid container spacing={2}>
					<Grid item xs={6} sm={6}>
						<Pie data={dataFiadosDashboard} options={optionsProductos}/>
					</Grid>
					<Grid item xs={6} sm={6}>
						<Doughnut data={dataProductosVendidos} options={optionsProductos}/>
					</Grid>
					<Grid item xs={12} sm={12}>
						<Line
							data={dataVentaMes}
							options={optionsProductos}
						/>
					</Grid>
					<Grid item xs={12} sm={12}>
						<Bar options={optionsProductos} data={dataProductosDashboard} />;
					</Grid>
				</Grid>
			</Container>
		</Page>
	)
}

export default Dashboard