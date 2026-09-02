const API_URL = "https://ev-faliure-1-auyq.onrender.com";


const form =
    document.getElementById("predictionForm");

const predictionText =
    document.getElementById("prediction");

const probabilityText =
    document.getElementById("probability");

const progressBar =
    document.getElementById("progressBar");

const analysisText =
    document.getElementById("analysisText");

const predictButton =
    document.querySelector(".predict-btn");

const resultIcon =
    document.getElementById("resultIcon");



form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Collect data from HTML form

        const batteryData = {

            battery_capacity_kwh:
                Number(
                    document.getElementById(
                        "battery_capacity_kwh"
                    ).value
                ),

            odometer_km:
                Number(
                    document.getElementById(
                        "odometer_km"
                    ).value
                ),

            vehicle_age_years:
                Number(
                    document.getElementById(
                        "vehicle_age_years"
                    ).value
                ),

            cycle_count:
                parseInt(
                    document.getElementById(
                        "cycle_count"
                    ).value
                ),

            battery_health_percent:
                Number(
                    document.getElementById(
                        "battery_health_percent"
                    ).value
                ),

            state_of_charge:
                Number(
                    document.getElementById(
                        "state_of_charge"
                    ).value
                ),

            depth_of_discharge:
                Number(
                    document.getElementById(
                        "depth_of_discharge"
                    ).value
                ),

            state_of_health:
                Number(
                    document.getElementById(
                        "state_of_health"
                    ).value
                ),

            cell_voltage_std:
                Number(
                    document.getElementById(
                        "cell_voltage_std"
                    ).value
                ),

            cell_temperature_max:
                Number(
                    document.getElementById(
                        "cell_temperature_max"
                    ).value
                ),

            internal_resistance:
                Number(
                    document.getElementById(
                        "internal_resistance"
                    ).value
                ),

            capacity_loss_percent:
                Number(
                    document.getElementById(
                        "capacity_loss_percent"
                    ).value
                ),

            charging_interruptions:
                parseInt(
                    document.getElementById(
                        "charging_interruptions"
                    ).value
                ),

            overcharge_events:
                parseInt(
                    document.getElementById(
                        "overcharge_events"
                    ).value
                )

        };


        console.log(
            "Sending Data:",
            batteryData
        );


        // Loading state

        predictButton.disabled = true;

        predictionText.textContent =
            "Analyzing...";

        probabilityText.textContent =
            "--";

        progressBar.style.width =
            "0%";

        analysisText.textContent =
            "Sending battery data to AI model...";


        try {


            // Send data to FastAPI backend

            const response = await fetch(

                `${API_URL}/predict`,

                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            batteryData
                        )

                }

            );


            // Convert response to JSON

            const result =
                await response.json();


            // Check API errors

            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Prediction failed"
                );

            }


            console.log(
                "Prediction Result:",
                result
            );


            // Show prediction

            predictionText.textContent =
                result.prediction;


            // Show probability

            if (
                result.probability !== undefined
            ) {

                const probability =
                    result.probability * 100;


                probabilityText.textContent =
                    probability.toFixed(2) + "%";


                setTimeout(

                    function () {

                        progressBar.style.width =
                            probability + "%";

                    },

                    200

                );

            }


            // Update battery UI

            updateResultVisual(
                result.prediction
            );


            analysisText.textContent =
                "AI prediction completed successfully";


        }


        catch (error) {


            console.error(
                "Error:",
                error
            );


            predictionText.textContent =
                "Connection Error";


            probabilityText.textContent =
                "--";


            progressBar.style.width =
                "0%";


            analysisText.textContent =
                error.message;


            resultIcon.className =
                "fa-solid fa-triangle-exclamation";


        }


        finally {


            predictButton.disabled = false;

        }


    }
);



function updateResultVisual(prediction) {


    const value =
        String(prediction).toLowerCase();


    // FAILURE DETECTED

    if (

        value === "1" ||

        value.includes("fail") ||

        value.includes("yes")

    ) {


        resultIcon.className =
            "fa-solid fa-battery-quarter";


        resultIcon.parentElement.style.color =
            "#ff4d6d";


        resultIcon.parentElement.style.boxShadow =
            "0 0 50px rgba(255,77,109,0.25)";


        progressBar.style.background =
            "linear-gradient(90deg, #ff4d6d, #ff9f43)";


        predictionText.style.color =
            "#ff4d6d";


    }


    // BATTERY HEALTHY

    else {


        resultIcon.className =
            "fa-solid fa-battery-full";


        resultIcon.parentElement.style.color =
            "#00e5ff";


        resultIcon.parentElement.style.boxShadow =
            "0 0 50px rgba(0,229,255,0.2)";


        progressBar.style.background =
            "linear-gradient(90deg, #00e5ff, #22c55e)";


        predictionText.style.color =
            "#22c55e";

    }

}