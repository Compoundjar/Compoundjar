export function DataTable({ headers, rows, bold, caption }) {
  return (
    <div className="prose-table">
      <table>
        {caption ? <caption className="chart-cap">{caption}</caption> : null}
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => {
                const content = bold === index ? <strong>{cell}</strong> : cell;
                if (index === 0) return <th key={cell} scope="row">{content}</th>;
                return <td key={`${index}-${cell}`}>{content}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
