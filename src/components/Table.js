import React from 'react';
import XLSX from "xlsx"
import { useState } from 'react';
import { ReactTabulator } from 'react-tabulator'
import { Modal, Form, Input, Select } from 'antd';
import "tabulator-tables/dist/css/tabulator.min.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement);

function Tabel(props) {
	const [excelData, setExcelData] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAnalysis1Open, setIsAnalysis1Open] = useState(false)
	const [isAnalysis2Open, setIsAnalysis2Open] = useState(false)
	const [selectedWKT, setSelectedWKT] = useState({})
	const [form] = Form.useForm();

	const handleChange = async (e) => {
		const file = e.target.files[0];
		const data = await file.arrayBuffer();
		const wb = XLSX.read(data);
		const ws = wb.Sheets[wb.SheetNames[0]];
		const jsonArr = XLSX.utils.sheet_to_json(ws)

		setExcelData(jsonArr)
	}

	const columns = [
		{ title: "ID", field: "id", hozAlign: "left", sorter: "number", headerFilter: true },
		{ title: "LEN", field: "len", hozAlign: "left", sorter: "number", headerFilter: true },
		{ title: "WKT", field: "wkt", hozAlign: "left", headerFilter: true },
		{ title: "STATUS", field: "status", hozAlign: "left", headerFilter: true },
		// edit data action
		{
			formatter: () => "<i class='fa fa-solid fa-pencil'></i>", width: 40, hozAlign: "center", headerSort: false,
			cellClick: function (e, cell) {
				const clickedId = cell.getRow().getData().id
				const clickedRow = excelData.find(item => (item.id === clickedId))

				form.setFieldValue("id", clickedRow.id)
				form.setFieldValue("status", clickedRow.status)
				form.setFieldValue("len", clickedRow.len)

				setIsModalOpen(true)
			}
		},
		// delete data action
		{
			formatter: () => "<i class='fa fa-solid fa-trash'></i>", width: 40, hozAlign: "center", headerSort: false,
			cellClick: function (e, cell) {
				cell.getRow().delete()
			}
		},
		// show map action
		{
			formatter: () => "<i class='fa fa-solid fa-map-pin'></i>", width: 40, hozAlign: "center", headerSort: false,
			cellClick: function (e, cell) {
				const { parse } = require('wkt');

				const clickedId = cell.getRow().getData().id
				const clickedRow = excelData.find(item => (item.id === clickedId))

				setSelectedWKT(parse(clickedRow.wkt));
			}
		},
	]

	console.log(selectedWKT.coordinates);

	const onFinish = (values) => {
		// edit data
		if (typeof values.id == "number" || values.id > 0) {
			let newExcelData = excelData.map(item => {
				if (item.id === values.id) {
					return {
						id: item.id,
						status: values.status,
						len: values.len,
						wkt: item.wkt
					}
				} else {
					return item
				}
			})
			setExcelData(newExcelData)
		}
		// add new data
		else {
			const lastId = excelData
				.map(item => item.id)
				.sort((a, b) => a - b)
				.pop()
			setExcelData([...excelData,
			{
				status: values.status,
				len: values.len,
				id: lastId + 1,
				wkt: ""
			}
			])
		}
	}

	const showModal = () => {
		form.setFieldValue("id", null)
		form.setFieldValue("len", null)
		form.setFieldValue("status", null)
		setIsModalOpen(true);
	};

	const handleOk = async () => {
		try {
			await form.validateFields()
			setIsModalOpen(false);
			form.submit();
		} catch (error) {
			console.log(error)
		}
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const showAnalysis1 = () => {
		setIsAnalysis1Open(!isAnalysis1Open)
	}

	const showAnalysis2 = () => {
		setIsAnalysis2Open(!isAnalysis2Open)
	}

	const status0 = () => {
		let count = 0
		excelData.map(item => item.status === 0 ? count++ : null)
		return count
	}

	const status1 = () => {
		let count = 0
		excelData.map(item => item.status === 1 ? count++ : null)
		return count
	}

	const status2 = () => {
		let count = 0
		excelData.map(item => item.status === 2 ? count++ : null)
		return count
	}

	const dataPieChart = {
		labels: [0, 1, 2],
		datasets: [
			{
				label: '# of Votes',
				data: [status0(), status1(), status2()],
				backgroundColor: [
					'rgb(255, 99, 132)',
					'rgb(54, 162, 235)',
					'rgb(255, 205, 86)',
				],
				borderColor: [
					'rgb(255, 99, 132)',
					'rgb(54, 162, 235)',
					'rgb(255, 205, 86)',
				],
				borderWidth: 1,
			},
		],
	};

	const len0 = () => {
		const len = []
		excelData.map(item => item.status === 0 ? len.push(item.len) : 0)
		if (excelData.length !== 0) {
			const count = len.reduce((total, value) => total + value)
			return count
		}
	}

	const len1 = () => {
		const len = []
		excelData.map(item => item.status === 1 ? len.push(item.len) : 0)
		if (excelData.length !== 0) {
			const count = len.reduce((total, value) => total + value)
			return count
		}
	}

	const len2 = () => {
		const len = []
		excelData.map(item => item.status === 2 ? len.push(item.len) : 0)
		if (excelData.length !== 0) {
			const count = len.reduce((total, value) => total + value)
			return count
		}
	}

	const dataBarChart = {
		labels: [0, 1, 2],
		datasets: [
			{
				label: '# of Votes',
				data: [len0(), len1(), len2()],
				backgroundColor: 'rgb(255, 0, 0)',
			},
		],
	};

	const options = {
		scales: {
			y: {
				beginAtZero: true
			}
		}
	}

	return (<>
		<input type="file" onChange={handleChange} />
		<button onClick={showModal} >Add New Data</button>

		<Modal title="Add new data" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
			<Form
				name="addNewData"
				form={form}
				onFinish={onFinish}
			>
				<Form.Item name="id" hidden={true}>
					<Input type='number' />
				</Form.Item>
				<Form.Item
					name="len" rules={[{ required: true, message: "Please input Len!" }]}
					label="Len məlumatlarını daxil edin:"
				>
					<Input type='number' />
				</Form.Item>
				<Form.Item
					name="status" rules={[{ required: true, message: "Please select Status!" }]}
					label="Status seçin:"
				>
					<Select>
						<Select.Option value={0}>0</Select.Option>
						<Select.Option value={1}>1</Select.Option>
						<Select.Option value={2}>2</Select.Option>
					</Select>
				</Form.Item>
			</Form>
		</Modal>

		<ReactTabulator
			data={excelData}
			columns={columns}
			options={{
				pagination: "local",
				paginationSize: 20,
				maxHeight: "100%",
				placeholder: "No Data Set",
				initialSort: [{
					column: "id",
					dir: "desc"
				}]
			}}
		/>

		<button onClick={showAnalysis1}>Analiz - 1</button>
		<button onClick={showAnalysis2}>Analiz - 2</button>

		<div style={{display: "flex"}}>
			{isAnalysis1Open ?
				<div style={{ width: "20%" }}>
					<Pie data={dataPieChart} />
				</div>
				: null
			}
			{isAnalysis2Open ?
				<div style={{ width: "30%" }}>
					<Bar data={dataBarChart} options={options} />
				</div>
				: null
			}
		</div>
	</>);
}

export default Tabel