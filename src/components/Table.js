import React from 'react';
import XLSX from "xlsx"
import { useState } from 'react';
import { ReactTabulator } from 'react-tabulator'
import { Modal, Form, Input, Select } from 'antd';
import "tabulator-tables/dist/css/tabulator.min.css";

function Tabel(props) {
	const [excelData, setExcelData] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const handleChange = async (e) => {
		const file = e.target.files[0];
		const data = await file.arrayBuffer();
		const wb = XLSX.read(data);
		const ws = wb.Sheets[wb.SheetNames[0]];
		const jsonArr = XLSX.utils.sheet_to_json(ws)

		// console.log({ jsonArr })
		setExcelData(jsonArr);
	}

	var printIcon = function (cell, formatterParams, onRendered) {
		return "<i class='fa-solid fa-pencil'></i>";
	};

	const columns = [
		{ title: "ID", field: "id", hozAlign: "left", sorter: "number", editor: "input", headerFilter: true },
		{ title: "LEN", field: "len", hozAlign: "left", sorter: "number", headerFilter: true },
		{ title: "WKT", field: "wkt", hozAlign: "left", headerFilter: true },
		{ title: "STATUS", field: "status", hozAlign: "left", headerFilter: true },
		{
			formatter: () => "<i class='fa fa-solid fa-pencil'></i>", width: 40, hozAlign: "center", headerSort: false,
			cellClick: function (e, cell) {
				const clickedId = cell.getRow().getData().id
				const clickedRow = excelData.find(item => (item.id === clickedId))
				form.setFieldValue("id", clickedRow.id)
				form.setFieldValue("status", clickedRow.status)
				form.setFieldValue("len",clickedRow.len)
				setIsModalOpen(true)
			}
		},
		{
			formatter: () => "<i class='fa fa-solid fa-trash'></i>", width: 40, hozAlign: "center", headerSort: false,
			cellClick: function (e, cell) {
				cell.getRow().delete()
			}
		},
		{
			formatter: () => "<i class='fa fa-solid fa-map-pin'></i>", width: 40, hozAlign: "center", headerSort: false,
			cellClick: function (e, cell) {
				// cell.getRow().delete()
			}
		},
	]

	const onFinish = (values) => {
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
		} else {
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

	</>);
}

export default Tabel