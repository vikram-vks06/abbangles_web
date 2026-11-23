const contactApiUrl =
  process.env.CONTACT_API_URL ||
  "https://abedobiz.abbangles.com/api/contactus";

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return Response.json(
      { success: false, message: "Unsupported enquiry form format." },
      { status: 415 },
    );
  }

  const form = new URLSearchParams(await request.text());
  const body = new URLSearchParams();
  for (const field of ["name", "email", "phone", "message"]) {
    body.set(field, form.get(field) || "");
  }
  if ([...body.values()].some((value) => !value.trim())) {
    return Response.json(
      { success: false, message: "Please complete all required fields." },
      { status: 400 },
    );
  }

  let upstream;
  try {
    upstream = await fetch(contactApiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Could not reach the contact enquiry service:", error);
    return Response.json(
      {
        success: false,
        message: "We could not connect to the enquiry service. Please try again later.",
      },
      { status: 502 },
    );
  }

  const responseText = await upstream.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    return Response.json(
      {
        success: false,
        message: upstream.ok
          ? "The enquiry service returned an invalid response."
          : "The enquiry service could not process your request.",
      },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return Response.json(
      { success: false, message: "The enquiry service returned an invalid response." },
      { status: 502 },
    );
  }
  if (!upstream.ok && !result.message) {
    result.message = "The enquiry service could not process your request.";
  }
  return Response.json(result, { status: upstream.status });
}
