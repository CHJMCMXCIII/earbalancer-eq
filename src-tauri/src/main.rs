// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
struct SaveResponse {
    success: bool,
    path: String,
    message: String,
}

/// Equalizer APO 설치 폴더 또는 문서 폴더에 캘리브레이션 설정 파일 자동 저장
#[tauri::command]
fn save_apo_config(filename: String, content: String) -> SaveResponse {
    // 1. Equalizer APO 기본 설치 디렉토리 탐색
    let apo_config_dir = PathBuf::from(r"C:\Program Files\EqualizerAPO\config");

    if apo_config_dir.exists() {
        let target_file = apo_config_dir.join(&filename);
        match fs::write(&target_file, &content) {
            Ok(_) => {
                return SaveResponse {
                    success: true,
                    path: target_file.to_string_lossy().to_string(),
                    message: "Equalizer APO config 폴더에 설정 파일이 성공적으로 자동 적용되었습니다!".into(),
                };
            }
            Err(e) => {
                eprintln!("APO config directory write failed (likely UAC/Permission): {}", e);
            }
        }
    }

    // 2. 권한 부족(UAC) 또는 미설치 시 [내 문서] 폴더로 안전하게 우회 저장
    let docs_dir = dirs_fallback_documents().join("EarBalancerEQ");
    let _ = fs::create_dir_all(&docs_dir);
    let fallback_file = docs_dir.join(&filename);

    match fs::write(&fallback_file, &content) {
        Ok(_) => SaveResponse {
            success: true,
            path: fallback_file.to_string_lossy().to_string(),
            message: "UAC 보안 권한으로 인해 [내 문서/EarBalancerEQ] 폴더에 안전하게 저장되었습니다.".into(),
        },
        Err(e) => SaveResponse {
            success: false,
            path: String::new(),
            message: format!("파일 저장에 실패했습니다: {}", e),
        },
    }
}

fn dirs_fallback_documents() -> PathBuf {
    if let Ok(userprofile) = std::env::var("USERPROFILE") {
        return PathBuf::from(userprofile).join("Documents");
    }
    PathBuf::from(".")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_apo_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
