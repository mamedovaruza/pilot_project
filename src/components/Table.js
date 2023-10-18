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

		console.log({ jsonArr })
		setExcelData(jsonArr);
	}

	const columns = [
		{ title: "ID", field: "id", hozAlign: "left", sorter: "number", headerFilter: true },
		{ title: "LEN", field: "len", hozAlign: "left", sorter: "number", headerFilter: true },
		{ title: "WKT", field: "wkt", hozAlign: "left", headerFilter: true },
		{ title: "STATUS", field: "status", hozAlign: "left", headerFilter: true },
	]

	const onFinish = (values) => {
		console.log(values)
	}

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleOk = () => {
		setIsModalOpen(false);
		form.submit();
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
				<Form.Item
					name="len" rules={[{ required: true, message: "Please input Len!" }]}
					label="Len məlumatlarını daxil edin:"
				>
					<Input />
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
				initialSort: [{
					column: "id",
					dir: "desc"
				}]
			}}
		/>

	</>);
}

export default Tabel