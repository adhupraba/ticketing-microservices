import { NextPage } from "next";
import { FormEvent, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { ErrorField } from "@src/types";
import ErrorList from "./ErrorList";

interface ICheckoutFormProps {}

const CheckoutForm: NextPage<ICheckoutFormProps> = () => {
  const [errors, setErrors] = useState<ErrorField[]>([]);

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
    });

    console.log("result from stripe ===>", result);

    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
      setErrors([{ message: result.error.message || "Something went wrong" }]);
      console.error(result.error);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <div className="card w-50">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <PaymentElement options={{ fields: { billingDetails: { address: "auto" } } }} />

          {!!errors.length && <ErrorList errors={errors} />}

          <button className="btn btn-primary mt-4" disabled={!stripe} type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
