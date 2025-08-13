package respond;

public class Response {
	public boolean err;
	public String msg;
	public Object data;

	public static Response Error(String msg) {
		Response r = new Response();
		r.msg = msg;
		r.err = true;
		return r;
	}

	public static Response Success() {
		Response r = new Response();
		r.msg = "success";
		r.err = false;
		return r;
	}

	public static Response SuccessMsg(String msg) {
		Response r = new Response();
		r.msg = msg;
		r.err = false;
		return r;
	}

	public static Response Success(Object data) {
		Response r = new Response();
		r.msg = "success";
		r.err = false;
		r.data = data;
		return r;
	}

	public static Response Success(String msg, Object data) {
		Response r = new Response();
		r.msg = msg;
		r.err = false;
		r.data = data;
		return r;
	}
}
