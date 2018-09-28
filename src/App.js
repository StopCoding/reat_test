import React, { Component } from 'react';
import logo from './babyxuan.png';
import './App.css';

import XLSX from 'xlsx';
import ReactTable from "react-table";
import 'react-table/react-table.css'

const BANK_DEBIT_AMOUNT = "借方金额";
const BANK_LENDER_AMOUNT = "贷方金额";
const BANK_COMPANY_NAME = "外行账户名称";
const BANK_COMPANY_OPEN_BANK_NAME = "外行开户行名称";
const ERP_DEBIT_AMOUNT = "输入借项";
const ERP_LENDER_AMOUNT = "输入贷项";
const ERP_COMPANY_NAME = "供应商或客户";

class App extends Component {

    constructor(props) {
        super( props );

        this._onFormSubmit=this._onFormSubmit.bind(this);
        this._onBankFileChange=this._onBankFileChange.bind(this);
        this._onBussFileChange=this._onBussFileChange.bind(this);
        this._renderData = this._renderData.bind(this);

        this.rABS = typeof FileReader!=='undefined' && FileReader.prototype && FileReader.prototype.readAsBinaryString;
        this.useworker = typeof Worker!=='undefined';
        this.bank_debit_index = -1;
        this.bank_lender_index = -1;
        this.bank_name_index = -1;
        this.bank_open_bank_index = -1;
        this.erp_debit_index = -1;
        this.erp_lender_index = -1;
        this.erp_name_index = -1;

        this.bank_debit_array = new Array();
        this.bank_lender_array = new Array();
        this.erp_debit_array = new Array();
        this.erp_lender_array = new Array();

        this.calc_debit_array = new Array();
        this.clac_lender_array = new Array();

        this.state = {
            bank_file: null,
            buss_file: null,
            calc_debit_array: null,
            dataSource: [],
        };

        this.columns = [{
            Header: '数据来源',
            accessor: 'source'
        },{
            Header: '借方金额',
            accessor: 'degit'
        }, {
            Header: '贷方金额',
            accessor: 'lender',
        }, {
            Header: '公司名称',
            accessor: 'name',
        }];

    }


    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">欢迎宝贝轩</h1>
                    <p style={{marginBottom: 30}}>银行、ERP对账v1.0</p>
                </header>

                <form>
                    <h1>银行明细xls文件</h1>
                    <input type="file"onChange={this._onBankFileChange}/>
                </form>

                <form>
                    <h1>企业ERP文件</h1>
                    <input type="file"onChange={this._onBussFileChange}/>
                </form>

                <button style={{marginTop: 30, marginBottom: 30}} onClick={this._onFormSubmit}>对比</button>

                <ReactTable
                    data={this.state.dataSource}
                    columns={this.columns}
                />
            </div>
        );
    }

    _renderData() {
        let calc_debit_array = this.calc_debit_array;
        let clac_lender_array = this.clac_lender_array;
        let data_source = new Array();

        if (calc_debit_array && calc_debit_array.length > 0) {
            for (let index in calc_debit_array) {
                let banks = calc_debit_array[index].bank;
                let erps = calc_debit_array[index].erp;
                for (let bank in banks) {
                    let item = {
                        source: '银行流水',
                        degit: this.bank_debit_array[banks[bank]].debitAmount,
                        lender: this.bank_debit_array[banks[bank]].lenderAmount,
                        name: this.bank_debit_array[banks[bank]].companyName,
                    };
                    data_source.push(item);
                }
                for (let erp in erps) {
                    let item = {
                        source: 'ERP',
                        degit: this.erp_lender_array[erps[erp]].debitAmount,
                        lender: this.erp_lender_array[erps[erp]].lenderAmount,
                        name: this.erp_lender_array[erps[erp]].companyName,
                    };
                    data_source.push(item);
                }
            }
        }

        if (clac_lender_array && clac_lender_array.length > 0) {
            for (let index in clac_lender_array) {
                let banks = clac_lender_array[index].bank;
                let erps = clac_lender_array[index].erp;
                for (let bank in banks) {
                    let item = {
                        source: '银行流水',
                        degit: this.bank_lender_array[banks[bank]].debitAmount,
                        lender: this.bank_lender_array[banks[bank]].lenderAmount,
                        name: this.bank_lender_array[banks[bank]].companyName,
                    };
                    data_source.push(item);
                }
                for (let erp in erps) {
                    let item = {
                        source: 'ERP',
                        degit: this.erp_debit_array[erps[erp]].debitAmount,
                        lender: this.erp_debit_array[erps[erp]].lenderAmount,
                        name: this.erp_debit_array[erps[erp]].companyName,
                    };
                    data_source.push(item);
                }
            }
        }

        this.setState({dataSource: data_source});

    }

    _calcLenderData() {

        this.clac_lender_array = new Array();

        // 1
        let bank_lender_array = [].concat(this.bank_lender_array);
        let erp_debit_array = [].concat(this.erp_debit_array);
        let bank_debit_length = bank_lender_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let index_erp = erp_debit_array.length - 1; index_erp >= 0; index_erp --) {
                let bank_debit_amount = bank_lender_array[index_bank].lenderAmount,
                    erp_lender_amount = erp_debit_array[index_erp].debitAmount;
                if (bank_debit_amount == erp_lender_amount) {
                    let bank = new Array();
                    bank.push(bank_lender_array[index_bank].index);
                    let erp = new Array();
                    erp.push(erp_debit_array[index_erp].index);
                    this.clac_lender_array.push({bank: bank, erp: erp});
                    bank_lender_array.splice(index_bank, 1);
                    erp_debit_array.splice(index_erp, 1);

                    break;
                } else if (bank_debit_amount < erp_lender_amount) {
                    break;
                }
            }
        }

        //2
        bank_debit_length = bank_lender_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let i = erp_debit_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j--) {
                    if (j<0) { break; }
                    let bank_debit_amount = bank_lender_array[index_bank].lenderAmount,
                        erp_lender_amount = erp_debit_array[i].debitAmount + erp_debit_array[j].debitAmount;
                    if (bank_debit_amount == erp_lender_amount) {
                        let bank = new Array();
                        bank.push(bank_lender_array[index_bank].index);
                        let erp = new Array();
                        erp.push(erp_debit_array[i].index);
                        erp.push(erp_debit_array[j].index);
                        this.clac_lender_array.push({bank: bank, erp: erp});
                        bank_lender_array.splice(index_bank, 1);
                        erp_debit_array.splice(i, 1);
                        erp_debit_array.splice(j, 1);

                        find_it = true;
                        break;
                    } else if (bank_debit_amount < erp_lender_amount) {
                        break;
                    }
                }
                if (find_it) { break; }
            }
        }
        //3
        bank_debit_length = bank_lender_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let i = erp_debit_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j--) {
                    for (let k = j - 1; k >= 0; k--) {
                        if (k<0) { break; }
                        let bank_debit_amount = bank_lender_array[index_bank].lenderAmount,
                            erp_lender_amount = erp_debit_array[i].debitAmount
                                + erp_debit_array[j].debitAmount + erp_debit_array[k].debitAmount;

                        if (bank_debit_amount == erp_lender_amount) {
                            let bank = new Array();
                            bank.push(bank_lender_array[index_bank].index);
                            let erp = new Array();
                            erp.push(erp_debit_array[i].index);
                            erp.push(erp_debit_array[j].index);
                            erp.push(erp_debit_array[k].index);
                            this.clac_lender_array.push({bank: bank, erp: erp});
                            bank_lender_array.splice(index_bank, 1);
                            erp_debit_array.splice(i, 1);
                            erp_debit_array.splice(j, 1);
                            erp_debit_array.splice(k, 1);

                            find_it = true;
                            break;
                        } else if (bank_debit_amount < erp_lender_amount) {
                            break;
                        }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }
        // 4
        bank_debit_length = bank_lender_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let i = erp_debit_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j--) {
                    for (let k = j - 1; k >= 0; k--) {
                        for (let l = k - 1; l >= 0; l--) {
                            if (l<0) { break; }
                            let bank_debit_amount = bank_lender_array[index_bank].lenderAmount,
                                erp_lender_amount = erp_debit_array[i].debitAmount
                                    + erp_debit_array[j].debitAmount + erp_debit_array[k].debitAmount
                                    + erp_debit_array[l].debitAmount;

                            if (bank_debit_amount == erp_lender_amount) {
                                let bank = new Array();
                                bank.push(bank_lender_array[index_bank].index);
                                let erp = new Array();
                                erp.push(erp_debit_array[i].index);
                                erp.push(erp_debit_array[j].index);
                                erp.push(erp_debit_array[k].index);
                                erp.push(erp_debit_array[l].index);
                                this.clac_lender_array.push({bank: bank, erp: erp});
                                bank_lender_array.splice(index_bank, 1);
                                erp_debit_array.splice(i, 1);
                                erp_debit_array.splice(j, 1);
                                erp_debit_array.splice(k, 1);
                                erp_debit_array.splice(l, 1);

                                find_it = true;
                                break;
                            } else if (bank_debit_amount < erp_lender_amount) {
                                break;
                            }
                        }
                        if (find_it) { break; }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }
        // 5
        bank_debit_length = bank_lender_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let i = erp_debit_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j--) {
                    for (let k = j - 1; k >= 0; k--) {
                        for (let l = k - 1; l >= 0; l--) {
                            for (let m = l - 1; m >= 0; m --) {
                                if (m<0) { break; }
                                let bank_debit_amount = bank_lender_array[index_bank].lenderAmount,
                                    erp_lender_amount = erp_debit_array[i].debitAmount
                                        + erp_debit_array[j].debitAmount + erp_debit_array[k].debitAmount
                                        + erp_debit_array[l].debitAmount + erp_debit_array[m].debitAmount;

                                if (bank_debit_amount == erp_lender_amount) {
                                    let bank = new Array();
                                    bank.push(bank_lender_array[index_bank].index);
                                    let erp = new Array();
                                    erp.push(erp_debit_array[i].index);
                                    erp.push(erp_debit_array[j].index);
                                    erp.push(erp_debit_array[k].index);
                                    erp.push(erp_debit_array[l].index);
                                    erp.push(erp_debit_array[m].index);
                                    this.clac_lender_array.push({bank: bank, erp: erp});
                                    bank_lender_array.splice(index_bank, 1);
                                    erp_debit_array.splice(i, 1);
                                    erp_debit_array.splice(j, 1);
                                    erp_debit_array.splice(k, 1);
                                    erp_debit_array.splice(l, 1);
                                    erp_debit_array.splice(m, 1);

                                    find_it = true;
                                    break;
                                } else if (bank_debit_amount < erp_lender_amount) {
                                    break;
                                }
                            }
                            if (find_it) { break; }
                        }
                        if (find_it) { break; }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }

        // 1
        let erp_lender_length = erp_debit_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let index_bank = bank_lender_array.length - 1; index_bank >= 0; index_bank --) {
                let erp_lender_amount = erp_debit_array[index_erp].debitAmount,
                    bank_debit_amount = bank_lender_array[index_bank].lenderAmount;
                if (erp_lender_amount == bank_debit_amount) {
                    let erp = new Array();
                    erp.push(erp_debit_array[index_erp].index);
                    let bank = new Array();
                    bank.push(bank_lender_array[index_bank].index);
                    this.clac_lender_array.push({erp: erp, bank: bank});
                    erp_debit_array.splice(index_erp, 1);
                    bank_lender_array.splice(index_bank, 1);

                    break;
                } else if (erp_lender_amount < bank_debit_amount) {
                    break;
                }
            }
        }
        // 2
        erp_lender_length = erp_debit_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let i = bank_lender_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j --) {
                    let erp_lender_amount = erp_debit_array[index_erp].debitAmount,
                        bank_debit_amount = bank_lender_array[i].lenderAmount + bank_lender_array[j].lenderAmount;
                    if (erp_lender_amount == bank_debit_amount) {
                        let erp = new Array();
                        erp.push(erp_debit_array[index_erp].index);
                        let bank = new Array();
                        bank.push(bank_lender_array[i].index);
                        bank.push(bank_lender_array[j].index);
                        this.clac_lender_array.push({erp: erp, bank: bank});
                        erp_debit_array.splice(index_erp, 1);
                        bank_lender_array.splice(i, 1);
                        bank_lender_array.splice(j, 1);

                        find_it = true;
                        break;
                    } else if (erp_lender_amount < bank_debit_amount) {
                        break;
                    }
                }
                if (find_it) { break; }
            }
        }
        // 3
        erp_lender_length = erp_debit_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let i = bank_lender_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j --) {
                    for (let k = j - 1; k >= 0; k--) {
                        let erp_lender_amount = erp_debit_array[index_erp].debitAmount,
                            bank_debit_amount = bank_lender_array[i].lenderAmount
                                + bank_lender_array[j].lenderAmount + bank_lender_array[k].lenderAmount;
                        if (erp_lender_amount == bank_debit_amount) {
                            let erp = new Array();
                            erp.push(erp_debit_array[index_erp].index);
                            let bank = new Array();
                            bank.push(bank_lender_array[i].index);
                            bank.push(bank_lender_array[j].index);
                            bank.push(bank_lender_array[k].index);
                            this.clac_lender_array.push({erp: erp, bank: bank});
                            erp_debit_array.splice(index_erp, 1);
                            bank_lender_array.splice(i, 1);
                            bank_lender_array.splice(j, 1);
                            bank_lender_array.splice(k, 1);

                            find_it = true;
                            break;
                        } else if (erp_lender_amount < bank_debit_amount) {
                            break;
                        }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }
        // 4
        erp_lender_length = erp_debit_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let i = bank_lender_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j --) {
                    for (let k = j - 1; k >= 0; k--) {
                        for (let l = k - 1; l >= 0; l --) {
                            let erp_lender_amount = erp_debit_array[index_erp].debitAmount,
                                bank_debit_amount = bank_lender_array[i].lenderAmount
                                    + bank_lender_array[j].lenderAmount + bank_lender_array[k].lenderAmount
                                    + bank_lender_array[l].lenderAmount;
                            if (erp_lender_amount == bank_debit_amount) {
                                let erp = new Array();
                                erp.push(erp_debit_array[index_erp].index);
                                let bank = new Array();
                                bank.push(bank_lender_array[i].index);
                                bank.push(bank_lender_array[j].index);
                                bank.push(bank_lender_array[k].index);
                                bank.push(bank_lender_array[l].index);
                                this.clac_lender_array.push({erp: erp, bank: bank});
                                erp_debit_array.splice(index_erp, 1);
                                bank_lender_array.splice(i, 1);
                                bank_lender_array.splice(j, 1);
                                bank_lender_array.splice(k, 1);
                                bank_lender_array.splice(l, 1);

                                find_it = true;
                                break;
                            } else if (erp_lender_amount < bank_debit_amount) {
                                break;
                            }
                        }
                        if (find_it) { break; }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }

        // 5
        erp_lender_length = erp_debit_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let i = bank_lender_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j --) {
                    for (let k = j - 1; k >= 0; k--) {
                        for (let l = k - 1; l >= 0; l --) {
                            for (let m = l - 1; m >= 0; m --) {
                                let erp_lender_amount = erp_debit_array[index_erp].debitAmount,
                                    bank_debit_amount = bank_lender_array[i].lenderAmount
                                        + bank_lender_array[j].lenderAmount + bank_lender_array[k].lenderAmount
                                        + bank_lender_array[l].lenderAmount + + bank_lender_array[m].lenderAmount;
                                if (erp_lender_amount == bank_debit_amount) {
                                    let erp = new Array();
                                    erp.push(erp_debit_array[index_erp].index);
                                    let bank = new Array();
                                    bank.push(bank_lender_array[i].index);
                                    bank.push(bank_lender_array[j].index);
                                    bank.push(bank_lender_array[k].index);
                                    bank.push(bank_lender_array[l].index);
                                    bank.push(bank_lender_array[m].index);
                                    this.clac_lender_array.push({erp: erp, bank: bank});
                                    erp_debit_array.splice(index_erp, 1);
                                    bank_lender_array.splice(i, 1);
                                    bank_lender_array.splice(j, 1);
                                    bank_lender_array.splice(k, 1);
                                    bank_lender_array.splice(l, 1);
                                    bank_lender_array.splice(m, 1);

                                    find_it = true;
                                    break;
                                } else if (erp_lender_amount < bank_debit_amount) {
                                    break;
                                }
                            }
                            if (find_it) { break; }
                        }
                        if (find_it) { break; }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }

        console.log("clac_lender_array: ", this.clac_lender_array);
        this.setState({clac_lender_array: this.clac_lender_array});

        this._renderData();
    }

    _onFormSubmit(e){
        e.preventDefault();

        this.calc_debit_array = new Array();

        // 1
        let bank_debit_array = [].concat(this.bank_debit_array);
        let erp_lender_array = [].concat(this.erp_lender_array);
        let bank_debit_length = bank_debit_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let index_erp = erp_lender_array.length - 1; index_erp >= 0; index_erp --) {
                let bank_debit_amount = bank_debit_array[index_bank].debitAmount,
                    erp_lender_amount = erp_lender_array[index_erp].lenderAmount;
                if (bank_debit_amount == erp_lender_amount) {
                    let bank = new Array();
                    bank.push(bank_debit_array[index_bank].index);
                    let erp = new Array();
                    erp.push(erp_lender_array[index_erp].index);
                    this.calc_debit_array.push({bank: bank, erp: erp});
                    bank_debit_array.splice(index_bank, 1);
                    erp_lender_array.splice(index_erp, 1);

                    break;
                } else if (bank_debit_amount < erp_lender_amount) {
                    break;
                }
            }
        }
        //2
        bank_debit_length = bank_debit_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let i = erp_lender_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j--) {
                    if (j<0) { break; }
                    let bank_debit_amount = bank_debit_array[index_bank].debitAmount,
                        erp_lender_amount = erp_lender_array[i].lenderAmount + erp_lender_array[j].lenderAmount;
                    if (bank_debit_amount == erp_lender_amount) {
                        let bank = new Array();
                        bank.push(bank_debit_array[index_bank].index);
                        let erp = new Array();
                        erp.push(erp_lender_array[i].index);
                        erp.push(erp_lender_array[j].index);
                        this.calc_debit_array.push({bank: bank, erp: erp});
                        bank_debit_array.splice(index_bank, 1);
                        erp_lender_array.splice(i, 1);
                        erp_lender_array.splice(j, 1);

                        find_it = true;
                        break;
                    } else if (bank_debit_amount < erp_lender_amount) {
                        break;
                    }
                }
                if (find_it) { break; }
            }
        }
        //3
        bank_debit_length = bank_debit_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let i = erp_lender_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j--) {
                    for (let k = j - 1; k >= 0; k--) {
                        if (k<0) { break; }
                        let bank_debit_amount = bank_debit_array[index_bank].debitAmount,
                            erp_lender_amount = erp_lender_array[i].lenderAmount
                                + erp_lender_array[j].lenderAmount + erp_lender_array[k].lenderAmount;

                        if (bank_debit_amount == erp_lender_amount) {
                            let bank = new Array();
                            bank.push(bank_debit_array[index_bank].index);
                            let erp = new Array();
                            erp.push(erp_lender_array[i].index);
                            erp.push(erp_lender_array[j].index);
                            erp.push(erp_lender_array[k].index);
                            this.calc_debit_array.push({bank: bank, erp: erp});
                            bank_debit_array.splice(index_bank, 1);
                            erp_lender_array.splice(i, 1);
                            erp_lender_array.splice(j, 1);
                            erp_lender_array.splice(k, 1);

                            find_it = true;
                            break;
                        } else if (bank_debit_amount < erp_lender_amount) {
                            break;
                        }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }
        // 4
        bank_debit_length = bank_debit_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let i = erp_lender_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j--) {
                    for (let k = j - 1; k >= 0; k--) {
                        for (let l = k - 1; l >= 0; l--) {
                            if (l<0) { break; }
                            let bank_debit_amount = bank_debit_array[index_bank].debitAmount,
                                erp_lender_amount = erp_lender_array[i].lenderAmount
                                    + erp_lender_array[j].lenderAmount + erp_lender_array[k].lenderAmount
                                    + erp_lender_array[l].lenderAmount;

                            if (bank_debit_amount == erp_lender_amount) {
                                let bank = new Array();
                                bank.push(bank_debit_array[index_bank].index);
                                let erp = new Array();
                                erp.push(erp_lender_array[i].index);
                                erp.push(erp_lender_array[j].index);
                                erp.push(erp_lender_array[k].index);
                                erp.push(erp_lender_array[l].index);
                                this.calc_debit_array.push({bank: bank, erp: erp});
                                bank_debit_array.splice(index_bank, 1);
                                erp_lender_array.splice(i, 1);
                                erp_lender_array.splice(j, 1);
                                erp_lender_array.splice(k, 1);
                                erp_lender_array.splice(l, 1);

                                find_it = true;
                                break;
                            } else if (bank_debit_amount < erp_lender_amount) {
                                break;
                            }
                        }
                        if (find_it) { break; }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }
        // 5
        bank_debit_length = bank_debit_array.length;
        for (let index_bank = bank_debit_length - 1; index_bank >= 0; index_bank --) {
            for (let i = erp_lender_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j--) {
                    for (let k = j - 1; k >= 0; k--) {
                        for (let l = k - 1; l >= 0; l--) {
                            for (let m = l - 1; m >= 0; m --) {
                                if (m<0) { break; }
                                let bank_debit_amount = bank_debit_array[index_bank].debitAmount,
                                    erp_lender_amount = erp_lender_array[i].lenderAmount
                                        + erp_lender_array[j].lenderAmount + erp_lender_array[k].lenderAmount
                                        + erp_lender_array[l].lenderAmount + erp_lender_array[m].lenderAmount;

                                if (bank_debit_amount == erp_lender_amount) {
                                    let bank = new Array();
                                    bank.push(bank_debit_array[index_bank].index);
                                    let erp = new Array();
                                    erp.push(erp_lender_array[i].index);
                                    erp.push(erp_lender_array[j].index);
                                    erp.push(erp_lender_array[k].index);
                                    erp.push(erp_lender_array[l].index);
                                    erp.push(erp_lender_array[m].index);
                                    this.calc_debit_array.push({bank: bank, erp: erp});
                                    bank_debit_array.splice(index_bank, 1);
                                    erp_lender_array.splice(i, 1);
                                    erp_lender_array.splice(j, 1);
                                    erp_lender_array.splice(k, 1);
                                    erp_lender_array.splice(l, 1);
                                    erp_lender_array.splice(m, 1);

                                    find_it = true;
                                    break;
                                } else if (bank_debit_amount < erp_lender_amount) {
                                    break;
                                }
                            }
                            if (find_it) { break; }
                        }
                        if (find_it) { break; }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }

        // 1
        let erp_lender_length = erp_lender_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let index_bank = bank_debit_array.length - 1; index_bank >= 0; index_bank --) {
                let erp_lender_amount = erp_lender_array[index_erp].lenderAmount,
                    bank_debit_amount = bank_debit_array[index_bank].debitAmount;
                if (erp_lender_amount == bank_debit_amount) {
                    let erp = new Array();
                    erp.push(erp_lender_array[index_erp].index);
                    let bank = new Array();
                    bank.push(bank_debit_array[index_bank].index);
                    this.calc_debit_array.push({erp: erp, bank: bank});
                    erp_lender_array.splice(index_erp, 1);
                    bank_debit_array.splice(index_bank, 1);

                    break;
                } else if (erp_lender_amount < bank_debit_amount) {
                    break;
                }
            }
        }

        // 2
        erp_lender_length = erp_lender_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let i = bank_debit_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j --) {
                    let erp_lender_amount = erp_lender_array[index_erp].lenderAmount,
                        bank_debit_amount = bank_debit_array[i].debitAmount + bank_debit_array[j].debitAmount;
                    if (erp_lender_amount == bank_debit_amount) {
                        let erp = new Array();
                        erp.push(erp_lender_array[index_erp].index);
                        let bank = new Array();
                        bank.push(bank_debit_array[i].index);
                        bank.push(bank_debit_array[j].index);
                        this.calc_debit_array.push({erp: erp, bank: bank});
                        erp_lender_array.splice(index_erp, 1);
                        bank_debit_array.splice(i, 1);
                        bank_debit_array.splice(j, 1);

                        find_it = true;
                        break;
                    } else if (erp_lender_amount < bank_debit_amount) {
                        break;
                    }
                }
                if (find_it) { break; }
            }
        }

        // 3
        erp_lender_length = erp_lender_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let i = bank_debit_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j --) {
                    for (let k = j - 1; k >= 0; k--) {
                        let erp_lender_amount = erp_lender_array[index_erp].lenderAmount,
                            bank_debit_amount = bank_debit_array[i].debitAmount
                                + bank_debit_array[j].debitAmount + bank_debit_array[k].debitAmount;
                        if (erp_lender_amount == bank_debit_amount) {
                            let erp = new Array();
                            erp.push(erp_lender_array[index_erp].index);
                            let bank = new Array();
                            bank.push(bank_debit_array[i].index);
                            bank.push(bank_debit_array[j].index);
                            bank.push(bank_debit_array[k].index);
                            this.calc_debit_array.push({erp: erp, bank: bank});
                            erp_lender_array.splice(index_erp, 1);
                            bank_debit_array.splice(i, 1);
                            bank_debit_array.splice(j, 1);
                            bank_debit_array.splice(k, 1);

                            find_it = true;
                            break;
                        } else if (erp_lender_amount < bank_debit_amount) {
                            break;
                        }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }

        // 4
        erp_lender_length = erp_lender_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let i = bank_debit_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j --) {
                    for (let k = j - 1; k >= 0; k--) {
                        for (let l = k - 1; l >= 0; l --) {
                            let erp_lender_amount = erp_lender_array[index_erp].lenderAmount,
                                bank_debit_amount = bank_debit_array[i].debitAmount
                                    + bank_debit_array[j].debitAmount + bank_debit_array[k].debitAmount
                                    + bank_debit_array[l].debitAmount;
                            if (erp_lender_amount == bank_debit_amount) {
                                let erp = new Array();
                                erp.push(erp_lender_array[index_erp].index);
                                let bank = new Array();
                                bank.push(bank_debit_array[i].index);
                                bank.push(bank_debit_array[j].index);
                                bank.push(bank_debit_array[k].index);
                                bank.push(bank_debit_array[l].index);
                                this.calc_debit_array.push({erp: erp, bank: bank});
                                erp_lender_array.splice(index_erp, 1);
                                bank_debit_array.splice(i, 1);
                                bank_debit_array.splice(j, 1);
                                bank_debit_array.splice(k, 1);
                                bank_debit_array.splice(l, 1);

                                find_it = true;
                                break;
                            } else if (erp_lender_amount < bank_debit_amount) {
                                break;
                            }
                        }
                        if (find_it) { break; }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }

        // 5
        erp_lender_length = erp_lender_array.length;
        for (let index_erp = erp_lender_length - 1; index_erp >= 0; index_erp --) {
            for (let i = bank_debit_array.length - 1; i >= 0; i --) {
                let find_it = false;
                for (let j = i - 1; j >= 0; j --) {
                    for (let k = j - 1; k >= 0; k--) {
                        for (let l = k - 1; l >= 0; l --) {
                            for (let m = l - 1; m >= 0; m --) {
                                let erp_lender_amount = erp_lender_array[index_erp].lenderAmount,
                                    bank_debit_amount = bank_debit_array[i].debitAmount
                                        + bank_debit_array[j].debitAmount + bank_debit_array[k].debitAmount
                                        + bank_debit_array[l].debitAmount + + bank_debit_array[m].debitAmount;
                                if (erp_lender_amount == bank_debit_amount) {
                                    let erp = new Array();
                                    erp.push(erp_lender_array[index_erp].index);
                                    let bank = new Array();
                                    bank.push(bank_debit_array[i].index);
                                    bank.push(bank_debit_array[j].index);
                                    bank.push(bank_debit_array[k].index);
                                    bank.push(bank_debit_array[l].index);
                                    bank.push(bank_debit_array[m].index);
                                    this.calc_debit_array.push({erp: erp, bank: bank});
                                    erp_lender_array.splice(index_erp, 1);
                                    bank_debit_array.splice(i, 1);
                                    bank_debit_array.splice(j, 1);
                                    bank_debit_array.splice(k, 1);
                                    bank_debit_array.splice(l, 1);
                                    bank_debit_array.splice(m, 1);

                                    find_it = true;
                                    break;
                                } else if (erp_lender_amount < bank_debit_amount) {
                                    break;
                                }
                            }
                            if (find_it) { break; }
                        }
                        if (find_it) { break; }
                    }
                    if (find_it) { break; }
                }
                if (find_it) { break; }
            }
        }


        console.log("calc_debit_array: ", this.calc_debit_array);
        this.setState({calc_debit_array: this.calc_debit_array});

        this._calcLenderData();
    }

    _handleBankFile(file) {
        let name = file.name;
        console.log("handle file: " + name);

        let reader = new FileReader();
        reader.onloadend = this._onBankFileLoadEnd.bind(this);
        if(this.rABS) reader.readAsBinaryString(file);
        else reader.readAsArrayBuffer(file);
    }

    _handleERPFile(file) {
        let name = file.name;
        console.log("handle file: " + name);

        let reader = new FileReader();
        reader.onloadend = this._onERPFileLoadEnd.bind(this);
        if(this.rABS) reader.readAsBinaryString(file);
        else reader.readAsArrayBuffer(file);
    }

    _onBankFileChange(e){
        let file = e.target.files[0];
        this.setState({bank_file: file});

        this._handleBankFile(file);
    }

    _onBussFileChange(e){
        let file = e.target.files[0];
        this.setState({buss_file: file});

        this._handleERPFile(file);
    }

    _onBankFileLoadEnd(e){
        console.log("bank file load end");

        let data=e.target.result;
        let readtype={type:this.rABS?'binary':'base64'};

        const wb=XLSX.read(data,readtype);
        const wsname=wb.SheetNames[0];
        const ws=wb.Sheets[wsname];
        const xlsxData=XLSX.utils.sheet_to_json(ws,{header:1});

        this._initBankData(xlsxData);
    }

    _onERPFileLoadEnd(e) {
        console.log("ERP file load end");

        let data=e.target.result;
        let readtype={type:this.rABS?'binary':'base64'};

        const wb=XLSX.read(data,readtype);
        const wsname=wb.SheetNames[0];
        const ws=wb.Sheets[wsname];
        const xlsxData=XLSX.utils.sheet_to_json(ws,{header:1});

        this._initERPData(xlsxData);
    }

    _initBankData(xlsxData) {
        if (xlsxData.length <= 0) { return }
        if (xlsxData[0].length <=0 ) { return }

        // 先找出借贷金额及公司名称index
        for (let index in xlsxData[0]) {
            switch (xlsxData[0][index]) {
                case BANK_DEBIT_AMOUNT:
                    this.bank_debit_index = index;
                    break;
                case BANK_LENDER_AMOUNT:
                    this.bank_lender_index = index;
                    break;
                case BANK_COMPANY_NAME:
                    this.bank_name_index = index;
                    break;
                case BANK_COMPANY_OPEN_BANK_NAME:
                    this.bank_open_bank_index = index;
                    break;
                default:
            }
        }
        if (this.bank_debit_index < 0 || this.bank_lender_index < 0) { return }

        // 遍历xlsx重新构造数据
        let data_array = new Array();
        for (let index in xlsxData) {
            if (index == 0) { continue }
            let data = xlsxData[index];
            if (data && (data[this.bank_debit_index] !== undefined || data[this.bank_lender_index] !== undefined)
                && (parseFloat(data[this.bank_debit_index]) != 0 || parseFloat(data[this.bank_lender_index]) != 0)) {
                data_array.push({
                    debitAmount: parseFloat(data[this.bank_debit_index]),
                    lenderAmount: parseFloat(data[this.bank_lender_index]),
                    companyName: data[this.bank_name_index],
                    openBankName: data[this.bank_open_bank_index],
                });
            }
        }

        // 银行借方金额排序重组
        this.bank_debit_array = new Array();
        let length = data_array.length;
        for (let index = 0; index < length; index ++) {
            let amount = 0, index_push = -1;
            for (let index in data_array) {
                if (amount < data_array[index].debitAmount) {
                    amount = data_array[index].debitAmount;
                    index_push = index;
                }
            }
            if (index_push !== -1) {
                this.bank_debit_array.push({...data_array[index_push], index: this.bank_debit_array.length});
                data_array.splice(index_push, 1);
            } else {
                break;
            }
        }
        console.log("bank_debit_array: ", this.bank_debit_array);

        // 银行贷方金额排序重组
        this.bank_lender_array = new Array();
        length = data_array.length;
        for (let index = 0; index < length; index ++) {
            let amount = 0, index_push = -1;
            for (let index in data_array) {
                if (amount < data_array[index].lenderAmount) {
                    amount = data_array[index].lenderAmount;
                    index_push = index;
                }
            }
            if (index_push !== -1) {
                this.bank_lender_array.push({...data_array[index_push], index: this.bank_lender_array.length});
                data_array.splice(index_push, 1);
            } else {
                break;
            }
        }
        console.log("bank_lender_array: ", this.bank_lender_array);
    }

    _initERPData(xlsxData) {
        if (xlsxData.length <= 0) { return }
        if (xlsxData[0].length <=0 ) { return }

        // 先找出借贷金额及供应商名称index
        for (let index in xlsxData[0]) {
            switch (xlsxData[0][index]) {
                case ERP_DEBIT_AMOUNT:
                    this.erp_debit_index = index;
                    break;
                case ERP_LENDER_AMOUNT:
                    this.erp_lender_index = index;
                    break;
                case ERP_COMPANY_NAME:
                    this.erp_name_index = index;
                    break;
                default:
            }
        }
        if (this.erp_debit_index < 0 || this.erp_lender_index < 0) { return }

        // 遍历xlsx重新构造数据
        let data_array = new Array();
        for (let index in xlsxData) {
            if (index == 0) { continue }
            let data = xlsxData[index];
            if (data && (data[this.erp_debit_index] !== undefined || data[this.erp_lender_index] !== undefined)
                && (parseFloat(data[this.erp_debit_index]) != 0 || parseFloat(data[this.erp_lender_index]) != 0)) {
                data_array.push({
                    debitAmount: parseFloat(data[this.erp_debit_index]),
                    lenderAmount: parseFloat(data[this.erp_lender_index]),
                    companyName: data[this.erp_name_index],
                });
            }
        }

        // ERP借方金额排序重组
        this.erp_debit_array = new Array();
        let length = data_array.length;
        for (let index = 0; index < length; index ++) {
            let amount = 0, index_push = -1;
            for (let index in data_array) {
                if (amount < data_array[index].debitAmount) {
                    amount = data_array[index].debitAmount;
                    index_push = index;
                }
            }
            if (index_push !== -1) {
                this.erp_debit_array.push({...data_array[index_push], index: this.erp_debit_array.length});
                data_array.splice(index_push, 1);
            } else {
                break;
            }
        }
        console.log("erp_debit_array: ", this.erp_debit_array);

        // 银行贷方金额排序重组
        this.erp_lender_array = new Array();
        length = data_array.length;
        for (let index = 0; index < length; index ++) {
            let amount = 0, index_push = -1;
            for (let index in data_array) {
                if (amount < data_array[index].lenderAmount) {
                    amount = data_array[index].lenderAmount;
                    index_push = index;
                }
            }
            if (index_push !== -1) {
                this.erp_lender_array.push({...data_array[index_push], index: this.erp_lender_array.length});
                data_array.splice(index_push, 1);
            } else {
                break;
            }
        }
        console.log("erp_lender_array: ", this.erp_lender_array);
    }

}

export default App;
