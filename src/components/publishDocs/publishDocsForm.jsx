import React, { Component } from 'react';

class PublishDocForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                title: "",
                domain: "",
                logoUrl: ""
            }
        }
    }



    handleDomainChange(e) {
        console.log(e.currentTarget.name)

        const data = { ...this.state.data }
        data[e.currentTarget.name] = e.currentTarget.value

        this.setState({ data })
    }

    handleTitleChange = (e) => {
        console.log(e.currentTarget.name)

        const data = { ...this.state.data }
        data[e.currentTarget.name] = e.currentTarget.value
        this.setState({ data })
    }

    handleUrlChange = (e) => {
        console.log(e.currentTarget.name)
        const data = { ...this.state.data }
        data[e.currentTarget.name] = e.currentTarget.value
        this.setState({ data })
    }



    render() {
        console.log(this.state.data)
        return (
            <React.Fragment>
                <div style={{ display: "flex", padding: "5px" }}>
                    <div style={{ minWidth: "70px" }}>
                        Domain:
            </div>
                    <input type="text" className="form-control" name="domain" value={this.state.domain} onChange={(e) => this.handleDomainChange(e)} />
                </div>
                <div style={{ display: "flex", padding: "5px" }}>
                    <div style={{ minWidth: "70px" }}>
                        Title:
            </div>
                    <input type="text" className="form-control" name="title" value={this.state.title} onChange={(e) => this.handleTitleChange(e)} />
                </div>
                <div style={{ display: "flex", padding: "5px" }}>
                    <div style={{ minWidth: "70px" }}>
                        LogoUrl:
            </div>
                    <input type="text" className="form-control" name="logoUrl" value={this.state.logoUrl} onChange={(e) => this.handleUrlChange(e)} />
                </div>
            </React.Fragment>
        );
    }
}

export default PublishDocForm;