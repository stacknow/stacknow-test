use std::io::Cursor;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response, Url, Blob, BlobPropertyBag};

// Point to the local proxy endpoint
const TARGET_URL: &str = "/api/proxy";

#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub async fn load_website() -> Result<(), JsValue> {
    let window = web_sys::window().expect("no global window exists");
    let document = window.document().expect("should have a document on window");
    
    // 1. Fetch from our local proxy
    let mut opts = RequestInit::new();
    opts.set_method("GET");
    // Same-origin is sufficient now since we are hitting our own domain
    opts.set_mode(RequestMode::SameOrigin); 

    let request = Request::new_with_str_and_init(TARGET_URL, &opts)?;
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;
    let resp: Response = resp_value.dyn_into().unwrap();

    if !resp.ok() { return Err(JsValue::from_str("Secure connection failed.")); }

    let buffer_promise = resp.array_buffer()?;
    let buffer = JsFuture::from(buffer_promise).await?;
    let uint8_array = js_sys::Uint8Array::new(&buffer);
    let bytes = uint8_array.to_vec();

    // ... (The rest of the logic remains exactly the same as before) ...
    // 2. Extract
    let cursor = Cursor::new(bytes.clone());
    let mut archive = tar::Archive::new(cursor);
    let mut asset_map: HashMap<String, String> = HashMap::new();
    let mut index_html_content = String::new();
    let mut is_tar = false;

    if let Ok(entries) = archive.entries() {
        for file_res in entries {
            if let Ok(mut file) = file_res {
                is_tar = true;
                let path_cow = file.path().unwrap_or_default();
                let path = path_cow.to_string_lossy().into_owned();
                if path.ends_with("/") { continue; }

                let mut content = Vec::new();
                use std::io::Read;
                if file.read_to_end(&mut content).is_ok() {
                    if path.ends_with("index.html") {
                        index_html_content = String::from_utf8_lossy(&content).to_string();
                    } else {
                        let array = js_sys::Uint8Array::from(&content[..]);
                        let parts = js_sys::Array::new();
                        parts.push(&array);
                        let mime_type = if path.ends_with(".css") { "text/css" }
                            else if path.ends_with(".js") { "application/javascript" }
                            else if path.ends_with(".png") { "image/png" }
                            else { "application/octet-stream" };
                        let mut blob_props = BlobPropertyBag::new();
                        blob_props.set_type(mime_type);
                        if let Ok(blob) = Blob::new_with_u8_array_sequence_and_options(&parts, &blob_props) {
                            if let Ok(url) = Url::create_object_url_with_blob(&blob) {
                                asset_map.insert(path, url);
                            }
                        }
                    }
                }
            }
        }
    }

    if !is_tar || index_html_content.is_empty() {
        index_html_content = String::from_utf8_lossy(&bytes).to_string();
    }

    for (filename, blob_url) in &asset_map {
        index_html_content = index_html_content.replace(&format!("\"{}\"", filename), &format!("\"{}\"", blob_url));
        index_html_content = index_html_content.replace(&format!("./{}", filename), blob_url);
    }

    // 3. Inject content
    let html_element = document.document_element().unwrap();
    html_element.set_inner_html(&index_html_content);
    
    if let Some(body) = document.body() {
        let style = body.style();
        let _ = style.set_property("opacity", "0");
        let _ = style.set_property("transition", "opacity 1.2s ease-in-out");
        let _ = style.set_property("background-color", "#0B221E");
    }

    // 4. Re-execute Scripts
    let scripts = document.get_elements_by_tag_name("script");
    for i in 0..scripts.length() {
        if let Some(old_script) = scripts.item(i) {
            if let Ok(old_script_el) = old_script.dyn_into::<web_sys::HtmlScriptElement>() {
                let new_script = document.create_element("script")?.dyn_into::<web_sys::HtmlScriptElement>()?;
                new_script.set_async(false);

                if let Some(src) = old_script_el.get_attribute("src") {
                    new_script.set_src(&src);
                } else {
                    let content = old_script_el.text()?;
                    if content.contains("tailwind.config") {
                         let safe_content = format!(
                            "var t_int = setInterval(function() {{ 
                                if(window.tailwind) {{ 
                                    clearInterval(t_int); 
                                    {}; 
                                    setTimeout(() => {{ document.body.style.opacity = '1'; }}, 100);
                                }} 
                            }}, 50);", 
                            content
                        );
                        let _ = new_script.set_text(&safe_content);
                    } else {
                        let _ = new_script.set_text(&content);
                    }
                }
                if let Some(body) = document.body() {
                    let body_node: &web_sys::Node = body.as_ref();
                    let _ = body_node.append_child(&new_script);
                }
            }
        }
    }

    Ok(())
}