import React, { Component } from "react";

class EditPage extends Component {
  name = React.createRef();
  contents = React.createRef();

  state = {
    data: {
      pageId: "",
      versionId: "",
      groupId: "",
      name: "",
      contents: ""
    },
    errors: {}
  };

  handleChange = e => {
    const data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
  };

  handleSubmit = e => {
    e.preventDefault();
    const data = { ...this.state.data };
    console.log("neqwwww", this.state);
    const name = this.name.current.value;
    const contents = this.contents.current.value;
    data.name = name;
    data.contents = contents;
    this.setState({ data });
    console.log("data", data);

    this.props.history.push({
      pathname: `/collections/pages/${this.state.data.pageId}`,
      data: data,
      title: "edit page"
    });
    console.log(this.state);
  };

  render() {
    // console.log(this.props.location.page)
    if (this.props.location.page) {
      const { id, versionId, name, contents } = this.props.location.page;
      this.state.data.pageId = id;
      this.state.data.versionId = versionId;
      this.state.data.name = name;
      this.state.data.contents = contents;
      this.props.history.push({ page: null });
    }
    return (
      <form onSubmit={this.handleSubmit}>
        <div class="form-group">
          <label for="exampleFormControlInput1">Page Name</label>
          <input
            ref={this.name}
            type="text"
            name="name"
            class="form-control"
            id="name"
            value={this.state.data.name}
            onChange={this.handleChange}
          />
        </div>
        <div class="form-group">
          <label for="exampleFormControlTextarea1">Contents</label>
          <textarea
            ref={this.contents}
            class="form-control"
            value={this.state.data.contents}
            onChange={this.handleChange}
            name="contents"
            id="contents"
            rows="20"
          />
          <button type="submit" class="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    );
  }
}

export default EditPage;
