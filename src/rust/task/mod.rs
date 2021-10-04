use std::{collections::HashMap, error::Error, sync::Mutex};

use neon::{prelude::*, result::Throw};
use once_cell::sync::Lazy;

pub static TASKS: Lazy<Mutex<HashMap<i64, Task>>> = Lazy::new(|| Mutex::new(HashMap::new()));

pub enum TaskStatus {
    RUNNING,
    CANCELLED,
    ERROR,
    DONE,
}

pub struct Task {
    pub id: i64,
    pub status: TaskStatus,
}

pub fn register_task(id: i64) -> Result<(), Box<dyn Error>> {
    let tasks = &mut *TASKS.lock()?;
    let task = tasks.get(&id);
    if let None = task {
        tasks.insert(
            id,
            Task {
                id,
                status: TaskStatus::RUNNING,
            },
        );
    }
    Ok(())
}

pub fn err_task(id: i64) -> Result<(), Box<dyn Error>> {
    let tasks = &mut *TASKS.lock()?;
    if let Some(task) = tasks.get_mut(&id) {
        task.status = TaskStatus::ERROR;
    }
    Ok(())
}

pub fn done_task(id: i64) -> Result<(), Box<dyn Error>> {
    let tasks = &mut *TASKS.lock()?;
    if let Some(task) = tasks.get_mut(&id) {
        task.status = TaskStatus::DONE;
    }
    Ok(())
}

pub fn should_task_continue(id: i64) -> bool {
    if let Ok(tasks) = TASKS.lock() {
        let tasks = &*tasks;
        if let Some(task) = tasks.get(&id) {
            matches!(task.status, TaskStatus::RUNNING)
        } else {
            false
        }
    } else {
        false
    }
}

pub fn cancel_task(mut c: FunctionContext) -> JsResult<JsUndefined> {
    let id = c.argument::<JsNumber>(0)?.value(&mut c) as i64;
    let tasks = &mut *TASKS.lock().unwrap();
    if let Some(task) = tasks.get_mut(&id) {
        task.status = TaskStatus::CANCELLED;
    }
    Ok(c.undefined())
}

pub fn export_members(c: &mut ModuleContext) -> Result<(), Throw> {
    let obj = c.empty_object();
    let mut export = |key, block| {
        let f = JsFunction::new(c, block)?;
        obj.set(c, key, f)?;
        Ok(())
    };
    export("cancel", cancel_task)?;
    c.export_value("task", obj)?;
    Ok(())
}
