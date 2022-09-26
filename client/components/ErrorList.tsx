import { ErrorField } from "@src/types";

interface IErrorListProps {
  errors: ErrorField[];
}

const ErrorList: React.FC<IErrorListProps> = ({ errors }) => {
  return (
    <div className="alert alert-danger">
      <h4>Ooops....</h4>
      <ul className="my-0">
        {errors.map((err, idx) => (
          <li key={idx}>{err.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorList;
