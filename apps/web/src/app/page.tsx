import Image from "next/image";
import supabase from "../../../../config/supabaseClient";

export default async function Home() {

  let { data: products, error } = await supabase
  .from('products')
  .select('*')

  if (error) {
    console.error(error)
  } else {
    console.log(products)
  }

  return (

    // show the products
    <div>
      {products?.map((product) => (
        <div key={product.id}>
          <h1>{product.name}</h1>
        </div>
      ))}
    </div>

    // <div>
    //   <h1>Hello World</h1>
    // </div>
  );
}
