import { Select, Statistic, Table } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { References, PageHeader, PageHeaders, VirtualTable } from "./Utils";


export function Pepr2ds() {
    const title = <span> PePr<sup>2</sup>DS </span>;

    // const dataSource = [
    //     {
    //         key: '1',
    //         name: 'PH',
    //         cathid: '2m14A00',
    //         pdbid: '2M14',
    //         uni1: 'P32776',
    //         uni2: 'TFB1_YEAST',
    //         atomnum: 262,
    //     },
    //     {
    //         key: '2',
    //         name: 'PH',
    //         cathid: '4dx8D00',
    //         pdbid: '4DX8',
    //         uni1: 'O14713',
    //         uni2: 'ITBP1_HUMAN',
    //         atomnum: 2345,
    //     },
    //     {
    //         key: '3',
    //         name: 'PH',
    //         cathid: '4dx8D00',
    //         pdbid: '4DX8',
    //         uni1: 'O14713',
    //         uni2: 'ITBP1_HUMAN',
    //         atomnum: 2345,
    //     },
    //     {
    //         key: '4',
    //         name: 'PH',
    //         cathid: '4dx8D00',
    //         pdbid: '4DX8',
    //         uni1: 'O14713',
    //         uni2: 'ITBP1_HUMAN',
    //         atomnum: 2345,
    //     },
    //     {
    //         key: '5',
    //         name: 'PH',
    //         cathid: '4dx8D00',
    //         pdbid: '4DX8',
    //         uni1: 'O14713',
    //         uni2: 'ITBP1_HUMAN',
    //         atomnum: 2345,
    //     },
    // ];

    // const columns = [
    //     {
    //         title: 'Domain',
    //         dataIndex: 'name',
    //         key: 'name',
    //     },
    //     {
    //         title: 'Cath ID',
    //         dataIndex: 'cathid',
    //         key: 'cathid',
    //     },
    //     {
    //         title: 'PDB ID',
    //         dataIndex: 'pdbid',
    //         key: 'pdbid',
    //     },
    //     {
    //         title: 'Uniprot_acc',
    //         dataIndex: 'uni1',
    //         key: 'uni1',
    //     },
    //     {
    //         title: 'Uniprot_id',
    //         dataIndex: 'uni2',
    //         key: 'uni2',
    //     },
    //     {
    //         title: 'Atom number',
    //         dataIndex: 'atomnum',
    //         key: 'atomnum',
    //     },
    // ];
    // Usage
  const columns = [
    { title: 'A', dataIndex: 'key', width: 150,
      filters: [{
            text: '% 10000 == 0',
            value: 'notUsed',
        },     
        ],
    onFilter: (_:any, record:any) => record.key % 10000 == 0, 
    },
    {
        title: 'B',
        dataIndex: 'key',
        width: 150,
        // defaultSortOrder: 'descend',
        sorter: (a:any, b:any) => a.key - b.key,
      },

    { title: 'C', dataIndex: 'key' },
    { title: 'D', dataIndex: 'key' },
    { title: 'E', dataIndex: 'key', width: 200 },
    { title: 'F', dataIndex: 'key', width: 100 },
  ];
  
  const data = Array.from({ length: 100000 }, (_, key) => ({ key }));

    const { Option } = Select;

    return (
        <Container>
            <PageHeader headerList={[PageHeaders.Home, PageHeaders.Pepr2ds]}
                title={title}
                subtitle={"Peripheral Protein Protrusion DataSet"}
            />
            <Row>
                <Col md={2} className="bg-light mx-2 py-2" > <Statistic title="Protein structures" value={6084} /> </Col>
                <Col md={2} className="bg-light mx-2 py-2" > <Statistic title="Protein domains" value={10} /> </Col>
                <Col md={2} className="bg-light mx-2 py-2" > <Statistic title="Download dataset" value={"156 MB"} /> </Col>
            </Row>

            <Row className="my-4">              
                <Col md={2}>
                    Domain: &nbsp;
                    <Select defaultValue="PH" style={{ width: 80 }} >
                        <Option value="C1">C1</Option>
                        <Option value="C2">C2</Option>
                        <Option value="C2DIS" > C2DIS</Option>
                        <Option value="ENTH">ENTH</Option>
                    </Select>
                </Col>
                <Col md={3}>
                    Data source: &nbsp;
                    <Select defaultValue="CATH" style={{ width: 90 }} >
                        <Option value="alphafold">AlphaFold</Option>
                    </Select>
                </Col>               
            </Row>

            <Row className="my-4">
                <Col>
                    {/* <Table dataSource={data} columns={columns} /> */}
                    <VirtualTable columns={columns} dataSource={data} scroll={{ y: 400, x: '100vw' }} />
                </Col>
            </Row>

        </Container>
    )
}