import { type FC } from "react";
import { Card, Spinner } from "react-bootstrap";

interface PDFViewerProps {
  pdfFile?: string | null;
  height?: string | number;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

const PDFViewer: FC<PDFViewerProps> = ({
  pdfFile,
  height = "440px",
  className,
  loading = false,
  error,
}) => {
  return (
    <Card
      className={`op-panel overflow-hidden d-flex align-items-center justify-content-center${className ? ` ${className}` : ""}`}
      style={className ? undefined : { height }}
    >
      {loading ? (
        <Spinner
          animation="border"
          variant="primary"
          className="text-primary"
        />
      ) : error ? (
        <div className="text-center text-danger">{error}</div>
      ) : pdfFile ? (
        <iframe
          src={pdfFile}
          title="PDF Viewer"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        />
      ) : (
        <div className="text-center" style={{ color: "var(--steel)" }}>
          No isometric selected.
        </div>
      )}
    </Card>
  );
};

export default PDFViewer;
