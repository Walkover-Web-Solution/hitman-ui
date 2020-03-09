import React from "react";
import { Table } from "react-bootstrap";

const GenericTable = ({
  title,
  dataArray,
  handleDelete,
  handleAdd,
  handleChange
}) => {
  return (
    <div>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>KEY</th>
            <th>VALUE</th>
            <th>DESCRIPTION</th>
          </tr>
        </thead>

        <tbody>
          {dataArray.map((e, index) => (
            <tr key={index}>
              <td>
                <input
                  name={index + ".key"}
                  value={dataArray[index].key}
                  onChange={handleChange}
                  type={"text"}
                  className="form-control"
                  style={{ border: "none" }}
                />
              </td>
              <td>
                <input
                  name={index + ".value"}
                  value={dataArray[index].value}
                  onChange={handleChange}
                  type={"text"}
                  className="form-control"
                  style={{ border: "none" }}
                />
              </td>
              <td>
                <input
                  name={index + ".description"}
                  value={dataArray[index].description}
                  onChange={handleChange}
                  type={"text"}
                  style={{ border: "none" }}
                  className="form-control"
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-light btn-sm btn-block"
                  onClick={() => handleDelete(index)}
                >
                  x
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td> </td>
            <td>
              {" "}
              <button
                type="button"
                className="btn btn-link btn-sm btn-block"
                onClick={() => handleAdd()}
              >
                {"+ " + title}
              </button>
            </td>
            <td> </td>
            <td> </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};
export default GenericTable;
