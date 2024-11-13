import { Link } from "react-router-dom"

const HomePage = () => {
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="text-center">
                <p>
                    This is home page
                </p>
                <Link className="text-blue-800 underline" to="/join">Click here to create or join room</Link>
            </div>
        </div>
    )
}

export default HomePage
